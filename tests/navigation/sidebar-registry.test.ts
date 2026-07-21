import test from "node:test";
import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { sidebarConfig, routeMetaMap } from "../../navigation/sidebarConfig";
import { DEPRECATED_ROUTES, INTERNAL_ROUTES, REMOVED_ROUTES, ROUTE_REDIRECTS } from "../../navigation/registry.mjs";
import { NAV_TARGETS } from "../../lib/search/navigation";
import { COMMANDS } from "../../lib/search/commands";

type RegistryItem = { label: string; href: string; group: string; kind: "main" | "sub"; permission: string };

const root = process.cwd();
const expectedModules = [
  "Dashboard", "Social", "Team", "K2 Messenger", "AI & Automation", "Insights", "Executive", "Queue Engine", "Inbox",
  "Media Library", "Notifications", "Workspace", "Users", "Security", "Backup", "Localization", "System",
];
const registry: RegistryItem[] = sidebarConfig.flatMap((section) => [
  { label: section.label, href: section.href, group: section.label, kind: "main" as const, permission: section.permission },
  ...section.children.map((child) => ({ label: child.label, href: child.href, group: section.label, kind: "sub" as const, permission: child.permission })),
]);

function duplicates(values: string[]) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

function routePath(href: string) {
  return href.split("?")[0].replace(/\/$/, "") || "/";
}

function pageFile(href: string) {
  const route = routePath(href);
  return route === "/"
    ? path.join(root, "app", "page.tsx")
    : path.join(root, "app", ...route.split("/").filter(Boolean), "page.tsx");
}

async function dashboardPages(directory = path.join(root, "app", "dashboard")): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const routes: string[] = [];
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      routes.push(...await dashboardPages(full));
    } else if (entry.name === "page.tsx") {
      const relative = path.relative(path.join(root, "app"), directory).split(path.sep).join("/");
      routes.push(`/${relative}`);
    }
  }
  return routes;
}

async function applicationPages(directory = path.join(root, "app")): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const routes: string[] = [];
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "api") continue;
      routes.push(...await applicationPages(full));
    } else if (entry.name === "page.tsx") {
      const relative = path.relative(path.join(root, "app"), directory).split(path.sep).join("/");
      routes.push(relative ? `/${relative}` : "/");
    }
  }
  return routes;
}

test("Blueprint v1.1 has exactly 17 unique modules and 64 unique sidebar items", () => {
  assert.deepEqual(sidebarConfig.map((section) => section.label), expectedModules);
  assert.deepEqual(duplicates(sidebarConfig.map((section) => section.key)), []);
  assert.deepEqual(duplicates(registry.map((item) => item.label)), []);
  assert.deepEqual(duplicates(registry.map((item) => item.href)), []);
  assert.equal(sidebarConfig.length, 17);
  assert.equal(registry.length, 64);
});

test("every sidebar item has a dedicated canonical page, permission, and breadcrumb mapping", async () => {
  for (const item of registry) {
    await assert.doesNotReject(access(pageFile(item.href)), `${item.label} is orphaned: ${item.href}`);
    assert.ok(item.permission, `${item.label} has no permission key`);
    const meta = routeMetaMap[item.href];
    assert.ok(meta, `${item.label} has no route metadata`);
    assert.equal(meta.permission, item.permission);
    assert.equal(meta.breadcrumbs[0], "Dashboard");
    assert.equal(meta.breadcrumbs.at(-1), item.kind === "main" ? (item.label === "Dashboard" ? "Dashboard" : sidebarConfig.find((section) => section.label === item.label)?.crumb) : item.label);
  }
});

test("search, sidebar, breadcrumb, icons, and active state consume the centralized registry", async () => {
  const byHref = new Map(registry.map((item) => [item.href, item]));
  assert.equal(NAV_TARGETS.length, registry.length);
  assert.deepEqual(duplicates(NAV_TARGETS.map((item) => item.id)), []);
  assert.deepEqual(duplicates(NAV_TARGETS.map((item) => item.href)), []);
  for (const target of NAV_TARGETS) {
    const canonical = byHref.get(target.href);
    assert.ok(canonical, `Search target is not canonical: ${target.href}`);
    assert.equal(target.label, canonical.label);
    assert.equal(target.permission, canonical.permission);
  }
  for (const command of COMMANDS) {
    if (command.run.kind === "navigate") {
      assert.ok(byHref.has(command.run.href), `Command uses a non-canonical route: ${command.id} -> ${command.run.href}`);
    }
    assert.equal(command.id.startsWith("go-"), false, `Duplicate navigation command remains: ${command.id}`);
  }

  const [sidebar, breadcrumb, search, commands, nextConfig] = await Promise.all([
    readFile(path.join(root, "components/layout/Sidebar.tsx"), "utf8"),
    readFile(path.join(root, "components/layout/Breadcrumb.tsx"), "utf8"),
    readFile(path.join(root, "lib/search/navigation.ts"), "utf8"),
    readFile(path.join(root, "lib/search/commands.ts"), "utf8"),
    readFile(path.join(root, "next.config.mjs"), "utf8"),
  ]);
  assert.ok(sidebar.includes("sidebarConfig"));
  assert.ok(breadcrumb.includes("routeMetaMap"));
  assert.ok(search.includes("sidebarConfig.flatMap"));
  assert.equal(commands.includes('href: "/dashboard'), false);
  assert.ok(nextConfig.includes('ROUTE_REDIRECTS } from "./navigation/registry.mjs"'));
  assert.equal(nextConfig.includes('{ source: "/'), false);
});

test("redirect aliases are unique, terminal, page-free, and target canonical routes", async () => {
  const sources = ROUTE_REDIRECTS.map((redirect) => redirect.source);
  const canonicalPaths = new Set(registry.map((item) => routePath(item.href)));
  assert.deepEqual(duplicates(sources), []);
  for (const redirect of ROUTE_REDIRECTS) {
    assert.equal(canonicalPaths.has(routePath(redirect.source)), false, `Redirect shadows canonical route ${redirect.source}`);
    assert.equal(sources.includes(routePath(redirect.destination)), false, `Redirect chain detected at ${redirect.destination}`);
    assert.ok(canonicalPaths.has(routePath(redirect.destination)), `Redirect destination is not canonical: ${redirect.destination}`);
    await assert.rejects(access(pageFile(redirect.source), constants.F_OK), `Redirect source still has a duplicate page: ${redirect.source}`);
  }
});

test("every concrete dashboard page is canonical and the placeholder catch-all is removed", async () => {
  const registered = new Set(registry.map((item) => routePath(item.href)));
  for (const page of await dashboardPages()) {
    assert.ok(registered.has(page), `Orphaned concrete dashboard page: ${page}`);
  }
  await assert.rejects(access(path.join(root, "app/dashboard/[module]/[...slug]/page.tsx"), constants.F_OK));
});

test("every application page is canonical or explicitly INTERNAL and global layouts protect it", async () => {
  const classified = new Set([
    ...registry.map((item) => routePath(item.href)),
    ...INTERNAL_ROUTES.filter((item) => !item.route.includes("*")).map((item) => item.route),
  ]);
  for (const page of await applicationPages()) {
    assert.ok(classified.has(page), `Unclassified or orphan application page: ${page}`);
  }
  await assert.doesNotReject(access(path.join(root, "app/dashboard/layout.tsx")));
  await assert.doesNotReject(access(path.join(root, "app/monitoring/layout.tsx")));
  const middleware = await readFile(path.join(root, "middleware.ts"), "utf8");
  assert.ok(middleware.includes('"/dashboard/:path*"'));
  assert.ok(middleware.includes('"/monitoring/:path*"'));
});

test("Facebook Live is removed while Unified Inbox remains the only Inbox destination", async () => {
  const inbox = sidebarConfig.find((section) => section.key === "inbox");
  assert.deepEqual(inbox?.children.map((child) => child.href), ["/dashboard/inbox/unified"]);
  assert.equal(registry.some((item) => item.label === "Facebook Live" || item.href === "/dashboard/social/facebook"), false);
  assert.equal(ROUTE_REDIRECTS.some((redirect) => redirect.source === "/dashboard/social/facebook"), false);
  await assert.rejects(access(pageFile("/dashboard/social/facebook"), constants.F_OK));
});

test("Team landing page renders inside the protected dashboard shell", async () => {
  const teamPage = await readFile(path.join(root, "app/dashboard/team/page.tsx"), "utf8");
  assert.equal(teamPage.includes("requirePermission("), false, "Team page must not call the request-bound API auth helper without a request");
  assert.equal(teamPage.includes("return null"), false, "Team page must not silently render an empty dashboard");
  assert.ok(teamPage.includes("<KanbanBoard />"));
  assert.ok(teamPage.includes("<ActivityTimeline />"));
});

test("CEO header card uses the canonical Executive route and accessible native button behavior", async () => {
  const topBar = await readFile(path.join(root, "components/layout/TopBar.tsx"), "utf8");
  assert.ok(topBar.includes('hrefForLabel("Executive")'));
  assert.equal(topBar.includes('router.push("/dashboard/executive")'), false);
  assert.ok(topBar.includes('<motion.button'));
  assert.ok(topBar.includes('type="button"'));
  assert.ok(topBar.includes('title="Executive Dashboard"'));
  assert.ok(topBar.includes('aria-label="Executive Dashboard"'));
  assert.ok(topBar.includes("focus-visible:ring-2"));
  assert.ok(topBar.includes("whileTap="));
});

test("removed routes have no page or redirect and no deprecated route remains live", async () => {
  assert.equal(DEPRECATED_ROUTES.length, 0);
  for (const removed of REMOVED_ROUTES) {
    assert.equal(ROUTE_REDIRECTS.some((redirect) => redirect.source === removed.route), false);
    await assert.rejects(access(pageFile(removed.route), constants.F_OK), `Removed route still has a page: ${removed.route}`);
  }
});
