import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("OpenAI provider uses server-side Responses streaming and the configured model", async () => {
  const source = await readFile("services/ai/provider.ts", "utf8");

  assert.ok(source.includes("process.env.OPENAI_API_KEY"));
  assert.ok(source.includes("client.responses.create"));
  assert.ok(source.includes('process.env.AI_MODEL ?? "gpt-5.6-sol"'));
  assert.ok(source.includes('event.type === "response.output_text.delta"'));
  assert.equal(source.includes('model: opts.model ?? "gpt-4o-mini"'), false);
});

test("OpenAI is represented in environment and health validation", async () => {
  const env = await readFile(".env.example", "utf8");
  const validation = await readFile("lib/env/validate.ts", "utf8");
  const health = await readFile("app/api/health/route.ts", "utf8");

  assert.ok(env.includes('AI_PROVIDER="openai"'));
  assert.ok(env.includes('AI_MODEL="gpt-5.6-sol"'));
  assert.ok(env.includes('OPENAI_API_KEY=""'));
  assert.ok(validation.includes('key: "OPENAI_API_KEY"'));
  assert.ok(health.includes("process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY"));
});
