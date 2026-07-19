import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { verifyMetaChallenge, verifyMetaWebhookSignature } from "../../services/inbox/meta-webhook";
import { getUserPermissions } from "../../services/auth/permissions";
import { checkInboxRateLimit } from "../../services/inbox/rate-limit";
import { JOB_HANDLERS } from "../../jobs";

test("Meta webhook verification rejects unsigned payloads and accepts the configured HMAC", () => {
  const previousSecret = process.env.META_APP_SECRET;
  process.env.META_APP_SECRET = "task77b-test-secret";
  const body = JSON.stringify({ object: "page", entry: [] });
  const signature = crypto.createHmac("sha256", process.env.META_APP_SECRET).update(body).digest("hex");
  assert.equal(verifyMetaWebhookSignature(body, null), false);
  assert.equal(verifyMetaWebhookSignature(body, "sha256=invalid"), false);
  assert.equal(verifyMetaWebhookSignature(body, `sha256=${signature}`), true);
  if (previousSecret === undefined) delete process.env.META_APP_SECRET; else process.env.META_APP_SECRET = previousSecret;
});

test("Meta challenge uses the configured verification token", () => {
  const previous = process.env.META_WEBHOOK_VERIFY_TOKEN;
  process.env.META_WEBHOOK_VERIFY_TOKEN = "verify-task77b";
  assert.equal(verifyMetaChallenge("subscribe", "verify-task77b"), true);
  assert.equal(verifyMetaChallenge("subscribe", "wrong"), false);
  if (previous === undefined) delete process.env.META_WEBHOOK_VERIFY_TOKEN; else process.env.META_WEBHOOK_VERIFY_TOKEN = previous;
});

test("central RBAC grants inbox operations by role and keeps viewers read-only", () => {
  const support = getUserPermissions("SUPPORT");
  const viewer = getUserPermissions("VIEWER");
  assert.ok(support.includes("VIEW_INBOX"));
  assert.ok(support.includes("REPLY_INBOX"));
  assert.ok(support.includes("MANAGE_SPAM"));
  assert.ok(viewer.includes("VIEW_INBOX"));
  assert.equal(viewer.includes("REPLY_INBOX"), false);
});

test("reply rate limiter applies a bounded window", () => {
  const key = `task77b-${Date.now()}`;
  assert.equal(checkInboxRateLimit(key, 2, 60_000).allowed, true);
  assert.equal(checkInboxRateLimit(key, 2, 60_000).allowed, true);
  assert.equal(checkInboxRateLimit(key, 2, 60_000).allowed, false);
});

test("reconciliation uses the existing centralized queue dispatcher", () => {
  assert.equal(typeof JOB_HANDLERS["sync:inbox"], "function");
  assert.equal(typeof JOB_HANDLERS["webhook:meta"], "function");
});

test("signed provider webhooks bypass session auth but remain globally rate limited", async () => {
  const middleware = await readFile("middleware.ts", "utf8");
  for (const route of ["/api/webhooks/meta", "/api/webhooks/website", "/api/website/webhook"]) {
    assert.ok(middleware.includes(`"${route}"`));
  }
  assert.ok(middleware.includes("!isRateLimitExempt(path)"));
  assert.equal(middleware.includes("path.startsWith(\"/api/\") && !isPublic(path)"), false);
});

test("approved Inbox UI no longer imports the mock dataset", async () => {
  const page = await readFile("app/dashboard/inbox/unified/page.tsx", "utf8");
  const aiPanel = await readFile("components/inbox/AIReplyPanel.tsx", "utf8");
  assert.equal(page.includes("@/data/inbox"), false);
  await assert.rejects(access("data/inbox.ts", constants.F_OK));
  for (const route of ["/api/inbox/conversations", "/api/inbox/stats"]) assert.ok(page.includes(route));
  assert.ok(aiPanel.includes("/api/inbox/ai"));
  await access("app/api/inbox/capabilities/route.ts", constants.F_OK);
});
