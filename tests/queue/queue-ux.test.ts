import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("database fallback is presented as an active informational state", async () => {
  const health = await readFile("components/queue/QueueHealth.tsx", "utf8");
  const dashboard = await readFile("components/queue/QueueDashboard.tsx", "utf8");
  const subpages = await readFile("components/queue/subpages.tsx", "utf8");

  for (const label of ["Development Mode", "Database Queue Active", "Redis Optional"]) {
    assert.ok(health.includes(label), `missing fallback label: ${label}`);
  }
  for (const value of ["Current Engine", "Database Queue", "Not Configured", "Available but Disabled", "Environment"]) {
    assert.ok(health.includes(value), `missing status card value: ${value}`);
  }
  assert.ok(health.includes("OFFLINE"));
  assert.ok(dashboard.includes("The platform is running normally using the built-in database queue."));
  assert.ok(dashboard.includes("Redis is recommended only for production environments or high-volume background processing."));
  assert.equal(dashboard.includes("Queue engine offline"), false);
  assert.equal(health.includes("Redis Down"), false);
  assert.ok(subpages.includes("Not configured · Optional in development"));
  assert.ok(subpages.includes("Available but disabled"));
});

test("connected Redis automatically exposes BullMQ and live metrics states", async () => {
  const health = await readFile("components/queue/QueueHealth.tsx", "utf8");
  const dashboard = await readFile("components/queue/QueueDashboard.tsx", "utf8");

  assert.ok(health.includes("Redis Connected"));
  assert.ok(health.includes("BullMQ Active"));
  assert.ok(health.includes("Live Queue Metrics"));
  assert.match(dashboard, /available \? \(/);
});

test("environment template contains only a managed Redis placeholder", async () => {
  const env = await readFile(".env.example", "utf8");
  const docs = await readFile("docs/deployment/environment.md", "utf8");
  const validation = await readFile("lib/env/validate.ts", "utf8");
  const validationScript = await readFile("scripts/validate-env.ts", "utf8");

  assert.ok(env.includes('REDIS_URL="redis://default:password@host:port"'));
  assert.ok(docs.includes("Never commit the real URL"));
  assert.ok(docs.includes("rediss://"));
  assert.ok(validation.includes("Optional in development"));
  assert.ok(validationScript.includes("loadEnvConfig(process.cwd())"));
});
