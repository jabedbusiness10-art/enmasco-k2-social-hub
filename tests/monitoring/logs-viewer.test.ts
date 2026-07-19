import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("LogsViewer uses a cancellable effect and handles network failures", async () => {
  const source = await readFile("components/monitoring/LogsViewer.tsx", "utf8");
  assert.ok(source.includes("useEffect(() =>"));
  assert.equal(source.includes("useMemo(() =>"), false);
  assert.ok(source.includes("new AbortController()"));
  assert.ok(source.includes("controller.abort()"));
  assert.ok(source.includes("catch (cause)"));
  assert.ok(source.includes("if (!r.ok)"));
  assert.ok(source.includes("credentials: \"same-origin\""));
});
