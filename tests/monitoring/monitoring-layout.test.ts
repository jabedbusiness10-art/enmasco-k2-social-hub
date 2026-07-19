import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("monitoring route keeps the shared dashboard shell", async () => {
  const source = await readFile("app/monitoring/layout.tsx", "utf8");

  assert.match(source, /import AppShell from ["']@\/components\/layout\/AppShell["']/);
  assert.match(source, /<AppShell>\{children\}<\/AppShell>/);
});
