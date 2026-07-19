import test from "node:test";
import assert from "node:assert/strict";
import { PUBLISH_PLATFORMS } from "../../services/publishing/engine";
import { publishTikTok } from "../../services/publishing/providers/tiktok";
import { publishYouTube } from "../../services/publishing/providers/youtube";
import { JOB_HANDLERS } from "../../jobs";

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
