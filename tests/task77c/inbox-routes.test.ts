import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { sidebarConfig } from "../../navigation/sidebarConfig";
import { ROUTE_REDIRECTS } from "../../navigation/registry.mjs";
import { NAV_TARGETS } from "../../lib/search/navigation";

const retiredRoutes = [
  "/dashboard/inbox/facebook",
  "/dashboard/inbox/instagram",
  "/dashboard/inbox/linkedin",
];

test("Inbox sidebar and search expose only the Unified Inbox destination", async () => {
  const inbox = sidebarConfig.find((section) => section.key === "inbox");
  assert.deepEqual(inbox?.children.map((child) => child.href), ["/dashboard/inbox/unified"]);
  assert.ok(NAV_TARGETS.some((target) => target.href === "/dashboard/inbox/unified"));
  for (const route of retiredRoutes) {
    assert.equal(sidebarConfig.some((section) => section.href === route || section.children.some((child) => child.href === route)), false);
    assert.equal(NAV_TARGETS.some((target) => target.href === route), false);
  }
});

test("retired provider Inbox URLs permanently redirect to Unified Inbox", () => {
  for (const route of retiredRoutes) {
    assert.ok(ROUTE_REDIRECTS.some((redirect) => redirect.source === route && redirect.destination === "/dashboard/inbox/unified" && redirect.permanent));
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
