import test from "node:test";
import assert from "node:assert/strict";
import { PUBLISH_PLATFORMS } from "../../services/publishing/engine";
import { publishTikTok } from "../../services/publishing/providers/tiktok";
import { publishYouTube } from "../../services/publishing/providers/youtube";
import { JOB_HANDLERS } from "../../jobs";
import {
  createPostSchema,
  normalizeCreatePostPayload,
  resolvePublishingTargets,
  summarizePublishingValidationIssues,
} from "../../app/api/publishing/create/contract";

const connectedFacebook = { id: "fb-account-1", platform: "FACEBOOK" as const, status: "CONNECTED", isActive: true };
const disconnectedFacebook = { id: "fb-account-2", platform: "FACEBOOK" as const, status: "DISCONNECTED", isActive: true };

test("enterprise publishing contract includes every core and future provider", () => {
  assert.deepEqual(PUBLISH_PLATFORMS, [
    "FACEBOOK", "INSTAGRAM", "TIKTOK", "YOUTUBE", "LINKEDIN", "WEBSITE",
    "X", "THREADS", "PINTEREST",
  ]);
});

test("TikTok fails gracefully before an API call when app approval is unavailable", async () => {
  const result = await publishTikTok(
    { providerCapabilities: { publish: false }, connectionMetadata: { publishingApproved: false } },
    "encrypted-token-is-never-exposed",
    { caption: "Launch", mediaUrls: ["https://cdn.example.com/launch.mp4"] },
  );
  assert.equal(result.ok, false);
  assert.equal(result.errorCode, "APP_APPROVAL_REQUIRED");
  assert.equal(result.retryable, false);
});

test("video providers reject missing video with a stable provider error", async () => {
  const [tiktok, youtube] = await Promise.all([
    publishTikTok({}, "token", { caption: "No video" }),
    publishYouTube({}, "token", { caption: "No video" }),
  ]);
  assert.equal(tiktok.errorCode, "VIDEO_REQUIRED");
  assert.equal(youtube.errorCode, "VIDEO_REQUIRED");
});

test("the shared queue dispatcher handles centralized and first-class provider jobs", () => {
  for (const job of ["publish:post", "publish:retry-due", "publish:tiktok", "publish:youtube", "publish:facebook", "publish:instagram", "publish:linkedin", "publish:website"]) {
    assert.equal(typeof JOB_HANDLERS[job], "function", `${job} must use the shared publishing handler`);
  }
});

test("valid Facebook text-only immediate post is accepted and resolved to connected account", () => {
  const parsed = createPostSchema.safeParse({
    caption: "Launch update",
    platforms: [{ platform: "FACEBOOK" }],
    mediaUrls: [],
  });
  assert.equal(parsed.success, true);
  if (!parsed.success) return;
  const resolved = resolvePublishingTargets(parsed.data, [connectedFacebook]);
  assert.equal(resolved.platforms[0].accountId, "fb-account-1");
});

test("valid scheduled Facebook post keeps ISO scheduledAt", () => {
  const iso = "2026-08-01T09:00:00.000Z";
  const parsed = createPostSchema.safeParse({
    caption: "Scheduled update",
    platforms: [{ platform: "FACEBOOK", accountId: "fb-account-1" }],
    scheduledAt: iso,
    timezone: "Asia/Riyadh",
  });
  assert.equal(parsed.success, true);
  if (!parsed.success) return;
  const resolved = resolvePublishingTargets(parsed.data, [connectedFacebook]);
  assert.equal(resolved.scheduledAt, iso);
});

test("missing content returns an actionable validation reason", () => {
  const parsed = createPostSchema.safeParse({ caption: "", platforms: [{ platform: "FACEBOOK" }] });
  assert.equal(parsed.success, false);
  if (parsed.success) return;
  const summary = summarizePublishingValidationIssues(parsed.error);
  assert.equal(summary.message, "Post content is required");
  assert.deepEqual(summary.fieldNames, ["caption"]);
});

test("no platform selected returns an actionable validation reason", () => {
  const parsed = createPostSchema.safeParse({ caption: "Launch", platforms: [] });
  assert.equal(parsed.success, false);
  if (parsed.success) return;
  const summary = summarizePublishingValidationIssues(parsed.error);
  assert.equal(summary.message, "Select at least one connected platform");
  assert.deepEqual(summary.fieldNames, ["platforms"]);
});

test("disconnected account selected is rejected before queue creation", () => {
  const parsed = createPostSchema.parse({
    caption: "Launch",
    platforms: [{ platform: "FACEBOOK", accountId: "fb-account-2" }],
  });
  assert.throws(
    () => resolvePublishingTargets(parsed, [disconnectedFacebook]),
    /Selected account is not connected/,
  );
});

test("malformed scheduledAt is rejected", () => {
  const parsed = createPostSchema.safeParse({
    caption: "Launch",
    platforms: [{ platform: "FACEBOOK" }],
    scheduledAt: "tomorrow morning",
  });
  assert.equal(parsed.success, false);
  if (parsed.success) return;
  const summary = summarizePublishingValidationIssues(parsed.error);
  assert.equal(summary.message, "Invalid scheduled date");
  assert.deepEqual(summary.fieldNames, ["scheduledAt"]);
});

test("legacy publishing payload normalizes message and socialAccountId", () => {
  const normalized = normalizeCreatePostPayload({
    message: "Legacy launch",
    platform: "FACEBOOK",
    socialAccountId: "fb-account-1",
  });
  const parsed = createPostSchema.parse(normalized);
  assert.equal(parsed.caption, "Legacy launch");
  assert.deepEqual(parsed.platforms, [{ platform: "FACEBOOK", accountId: "fb-account-1" }]);
});
