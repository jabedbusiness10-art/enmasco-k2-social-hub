import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";

const retiredRoutes = [
  "/dashboard/inbox/facebook",
  "/dashboard/inbox/instagram",
  "/dashboard/inbox/linkedin",
];

test("Inbox sidebar and search expose only the Unified Inbox destination", async () => {
  const [sidebar, navigation] = await Promise.all([
    readFile("navigation/sidebarConfig.ts", "utf8"),
    readFile("lib/search/navigation.ts", "utf8"),
  ]);

  assert.ok(sidebar.includes('label: "Unified Inbox", href: "/dashboard/inbox/unified"'));
  assert.ok(navigation.includes('id: "inbox-unified"'));
  for (const route of retiredRoutes) {
    assert.equal(sidebar.includes(route), false);
    assert.equal(navigation.includes(route), false);
  }
});

test("retired provider Inbox URLs permanently redirect to Unified Inbox", async () => {
  const config = await readFile("next.config.mjs", "utf8");
  for (const route of retiredRoutes) {
    assert.ok(config.includes(`{ source: "${route}", destination: "/dashboard/inbox/unified", permanent: true }`));
  }
});

test("Unified Inbox retains every supported provider filter", async () => {
  const [filters, platformMeta] = await Promise.all([
    readFile("components/inbox/InboxFilters.tsx", "utf8"),
    readFile("components/inbox/platformMeta.ts", "utf8"),
  ]);

  assert.ok(filters.includes('label: "All Platforms"'));
  for (const provider of ["facebook", "instagram", "linkedin", "tiktok", "youtube", "website", "whatsapp"]) {
    assert.ok(platformMeta.includes(`${provider}: {`), `${provider} filter is missing`);
  }
});

test("no dedicated provider Inbox page components remain", async () => {
  for (const provider of ["facebook", "instagram", "linkedin"]) {
    await assert.rejects(access(`app/dashboard/inbox/${provider}/page.tsx`, constants.F_OK));
  }
  const unified = await readFile("app/dashboard/inbox/unified/page.tsx", "utf8");
  assert.ok(unified.includes("<InboxFilters"));
});
