import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getAIProvider } from "../../services/ai/provider";

test("provider selection follows runtime environment changes without stale caching", () => {
  const originalProvider = process.env.AI_PROVIDER;
  const originalKey = process.env.OPENROUTER_API_KEY;

  try {
    process.env.AI_PROVIDER = "mock";
    assert.equal(getAIProvider().id, "mock");

    process.env.AI_PROVIDER = "openrouter";
    process.env.OPENROUTER_API_KEY = "test-only-key";
    assert.equal(getAIProvider().id, "openrouter");
    assert.equal(getAIProvider().isConfigured, true);

    delete process.env.OPENROUTER_API_KEY;
    assert.equal(getAIProvider().isConfigured, false);
  } finally {
    if (originalProvider === undefined) delete process.env.AI_PROVIDER;
    else process.env.AI_PROVIDER = originalProvider;
    if (originalKey === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = originalKey;
  }
});

test("assistant persistence happens after provider streaming completes", async () => {
  const source = await readFile("services/ai/index.ts", "utf8");
  const streamStart = source.indexOf("for await (const chunk of provider.streamChat");
  const persistence = source.indexOf("await prisma.aIMessage.create", streamStart);
  const doneEvent = source.indexOf('JSON.stringify({ done: true })', streamStart);

  assert.ok(streamStart >= 0);
  assert.ok(persistence > streamStart);
  assert.ok(doneEvent > persistence);
  assert.equal(source.includes("persist assistant message + token usage after streaming starts"), false);
});
