import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("development unregisters stale PWA workers and clears K2 caches", async () => {
  const source = await readFile("components/pwa/PWAProvider.tsx", "utf8");

  assert.match(source, /process\.env\.NODE_ENV !== "production"/);
  assert.match(source, /navigator\.serviceWorker\.getRegistrations\(\)/);
  assert.match(source, /registration\.unregister\(\)/);
  assert.match(source, /key\.startsWith\("k2kai-"\)/);
  assert.match(source, /window\.location\.reload\(\)/);
});

test("service worker never caches API responses", async () => {
  const source = await readFile("public/service-worker.js", "utf8");
  const apiBranch = source.match(/if \(url\.pathname\.startsWith\("\/api\/"\)\) \{[\s\S]*?\n  \}/)?.[0] ?? "";

  assert.match(apiBranch, /event\.respondWith\(fetch\(req\)\)/);
  assert.doesNotMatch(apiBranch, /networkFirst/);
});

test("monitoring is protected by the admin middleware", async () => {
  const source = await readFile("middleware.ts", "utf8");

  assert.match(source, /ADMIN_PREFIXES[^\n]*"\/monitoring"/);
  assert.match(source, /"\/monitoring\/:path\*"/);
});
