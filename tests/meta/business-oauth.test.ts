import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { buildAuthUrl, getMetaOAuthPlan } from "../../services/meta/oauth";

const root = process.cwd();

function withMetaEnv<T>(features: string, run: () => T): T {
  const keys = ["META_APP_ID", "META_APP_SECRET", "META_REDIRECT_URI", "META_LOGIN_CONFIG_ID", "META_OAUTH_FEATURES"] as const;
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  Object.assign(process.env, {
    META_APP_ID: "test-app-id",
    META_APP_SECRET: "test-app-secret",
    META_REDIRECT_URI: "https://example.test/api/social/meta/callback",
    META_LOGIN_CONFIG_ID: "business-config-123",
    META_OAUTH_FEATURES: features,
  });
  try {
    return run();
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
}

test("Business Login URL uses config_id and never sends a generic scope list", () => {
  withMetaEnv("facebook_connect", () => {
    const url = new URL(buildAuthUrl("csrf-state"));
    assert.equal(url.searchParams.get("config_id"), "business-config-123");
    assert.equal(url.searchParams.get("scope"), null);
    assert.equal(url.searchParams.get("state"), "csrf-state");
    assert.equal(url.searchParams.get("response_type"), "code");
  });
});

test("Meta permissions are enabled incrementally from the minimum Page connection stage", () => {
  withMetaEnv("facebook_connect", () => {
    assert.deepEqual(getMetaOAuthPlan().requestedScopes, ["pages_show_list", "pages_read_engagement"]);
  });
  withMetaEnv("facebook_connect,facebook_publish,instagram_publish", () => {
    assert.deepEqual(getMetaOAuthPlan().requestedScopes, [
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_posts",
      "instagram_basic",
      "instagram_content_publish",
    ]);
  });
  withMetaEnv("facebook_connect,facebook_insights,instagram_publish,instagram_insights", () => {
    const scopes = getMetaOAuthPlan().requestedScopes;
    assert.ok(scopes.includes("read_insights"));
    assert.ok(scopes.includes("instagram_manage_insights"));
  });
});

test("Meta callback enforces Page full control and skips Instagram until enabled", async () => {
  const callback = await readFile(path.join(root, "app/api/social/meta/callback/route.ts"), "utf8");
  assert.ok(callback.includes('candidate.tasks?.includes("MANAGE")'));
  assert.ok(callback.includes('plan.features.includes("instagram_publish")'));
  assert.ok(callback.includes("instagramEnabled ? await getInstagramBusiness"));
  assert.ok(callback.includes("requestedScopes"));
  assert.ok(callback.includes("missingScopes"));
});
