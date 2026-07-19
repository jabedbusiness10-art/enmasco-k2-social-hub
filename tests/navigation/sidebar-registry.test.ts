import test from "node:test";
import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { sidebarConfig } from "../../navigation/sidebarConfig";
import { NAV_TARGETS } from "../../lib/search/navigation";

type RegistryItem = { label: string; href: string; group: string; kind: "main" | "sub" };

const root = process.cwd();
const registry: RegistryItem[] = sidebarConfig.flatMap((section) => [
  { label: section.label, href: section.href, group: section.label, kind: "main" as const },
  ...section.children.map((child) => ({ label: child.label, href: child.href, group: section.label, kind: "sub" as const })),
]);

function duplicates(values: string[]) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

function routePath(href: string) {
  return href.split("?")[0].replace(/\/$/, "") || "/";
}

function pageFile(href: string) {
  return path.join(root, "app", ...routePath(href).split("/").filter(Boolean), "page.tsx");
}

async function dashboardPages(directory = path.join(root, "app", "dashboard")): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const routes: string[] = [];
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith("[")) continue;
      routes.push(...await dashboardPages(full));
    } else if (entry.name === "page.tsx") {
      const relative = path.relative(path.join(root, "app"), directory).split(path.sep).join("/");
      routes.push(`/${relative}`);
    }
  }
  return routes;
}

test("sidebar has unique keys, labels, and canonical routes", () => {
  assert.deepEqual(duplicates(sidebarConfig.map((section) => section.key)), []);
  assert.deepEqual(duplicates(registry.map((item) => item.label)), []);
  assert.deepEqual(duplicates(registry.map((item) => item.href)), []);
  assert.equal(registry.length, 65);
});

test("every sidebar route has a dedicated page and never relies on the placeholder catch-all", async () => {
  for (const item of registry) {
    await assert.doesNotReject(access(pageFile(item.href)), `${item.label} is orphaned: ${item.href}`);
  }
});

test("search navigation uses only canonical sidebar routes and canonical names", () => {
  const byHref = new Map(registry.map((item) => [item.href, item]));
  assert.deepEqual(duplicates(NAV_TARGETS.map((item) => item.id)), []);
  assert.deepEqual(duplicates(NAV_TARGETS.map((item) => item.href)), []);
  for (const target of NAV_TARGETS) {
    const canonical = byHref.get(target.href);
    assert.ok(canonical, `Search target is not in the canonical sidebar registry: ${target.href}`);
    assert.equal(target.label, canonical.label, `Inconsistent label for ${target.href}`);
  }
});

test("redirect aliases are unique, terminal, and never shadow a canonical route", async () => {
  const source = await readFile(path.join(root, "next.config.mjs"), "utf8");
  const redirects = [...source.matchAll(/\{ source: "([^"]+)", destination: "([^"]+)", permanent: true \}/g)]
    .map((match) => ({ source: match[1], destination: match[2] }));
  const sources = redirects.map((redirect) => redirect.source);
  const canonicalPaths = new Set(registry.map((item) => routePath(item.href)));
  assert.deepEqual(duplicates(sources), []);
  for (const redirect of redirects) {
    assert.equal(canonicalPaths.has(routePath(redirect.source)), false, `Redirect shadows canonical route ${redirect.source}`);
    assert.equal(sources.includes(routePath(redirect.destination)), false, `Redirect chain detected at ${redirect.destination}`);
    await assert.doesNotReject(access(pageFile(redirect.destination)), `Redirect destination is orphaned: ${redirect.destination}`);
  }
});

test("every concrete dashboard page is registered as canonical or as a compatibility destination", async () => {
  const source = await readFile(path.join(root, "next.config.mjs"), "utf8");
  const compatibilityDestinations = new Set(
    [...source.matchAll(/destination: "([^"]+)"/g)].map((match) => routePath(match[1])),
  );
  const registered = new Set(registry.map((item) => routePath(item.href)));
  for (const page of await dashboardPages()) {
    assert.ok(registered.has(page) || compatibilityDestinations.has(page), `Orphaned concrete dashboard page: ${page}`);
  }
});

