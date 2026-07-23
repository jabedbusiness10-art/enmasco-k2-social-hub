import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  buildAuthUrl,
  discoverPageById,
  discoverPages,
  getMetaOAuthPlan,
  getSelectedMetaPageIds,
} from "../../services/meta/oauth";

const root = process.cwd();

function withMetaEnv<T>(features: string, run: () => T): T {
  const keys = ["META_APP_ID", "META_APP_SECRET", "META_REDIRECT_URI", "META_LOGIN_CONFIG_ID", "META_OAUTH_FEATURES"] as const;
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  Object.assign(process.env, {
    META_APP_ID: "123456789",
    META_APP_SECRET: "test-app-secret",
    META_REDIRECT_URI: "https://example.test/api/social/meta/callback",
    META_LOGIN_CONFIG_ID: "987654321",
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
    assert.equal(url.searchParams.get("config_id"), "987654321");
    assert.equal(url.searchParams.get("scope"), null);
    assert.equal(url.searchParams.get("state"), "csrf-state");
    assert.equal(url.searchParams.get("response_type"), "code");
  });
});

test("Meta permissions are enabled incrementally from the minimum Page connection stage", () => {
  withMetaEnv("facebook_connect", () => {
    assert.deepEqual(getMetaOAuthPlan().requestedScopes, [
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_metadata",
      "pages_read_user_content",
      "pages_manage_engagement",
      "business_management",
    ]);
  });
  withMetaEnv("facebook_connect,facebook_publish,instagram_publish", () => {
    assert.deepEqual(getMetaOAuthPlan().requestedScopes, [
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_metadata",
      "pages_read_user_content",
      "pages_manage_engagement",
      "business_management",
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

test("Meta Page selection accepts callback and granular-scope target IDs", () => {
  const params = new URLSearchParams({ selected_page_id: "12345", target_id: "not-an-id" });
  assert.deepEqual(
    getSelectedMetaPageIds(params, {
      granular_scopes: [
        { scope: "pages_manage_posts", target_ids: ["67890", "12345"] },
        { scope: "email", target_ids: ["99999"] },
      ],
    }),
    ["12345", "67890"],
  );
});

test("Meta Page discovery preserves status and Page metadata", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        data: [
          {
            id: "12345",
            name: "Example Page",
            access_token: "test-page-token",
            tasks: ["MANAGE", "CREATE_CONTENT"],
          },
        ],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  try {
    const result = await discoverPages("test-user-token");
    assert.equal(result.ok, true);
    assert.equal(result.status, 200);
    assert.equal(result.pages.length, 1);
    assert.equal(result.pages[0]?.id, "12345");
    assert.equal(result.pages[0]?.name, "Example Page");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Meta selected Page fallback resolves a Page by ID", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        id: "67890",
        name: "Selected Page",
        access_token: "test-page-token",
        tasks: ["CREATE_CONTENT"],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  try {
    const result = await discoverPageById("test-user-token", "67890");
    assert.equal(result.ok, true);
    assert.equal(result.status, 200);
    assert.equal(result.pages[0]?.id, "67890");
    assert.equal(result.pages[0]?.name, "Selected Page");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Meta callback enforces Page management and skips Instagram until enabled", async () => {
  const callback = await readFile(path.join(root, "app/api/social/meta/callback/route.ts"), "utf8");
  assert.ok(callback.includes('task === "MANAGE" || task === "CREATE_CONTENT"'));
  assert.ok(callback.includes('plan.features.includes("instagram_publish")'));
  assert.ok(callback.includes("instagramEnabled"));
  assert.ok(callback.includes("getInstagramBusiness"));
  assert.ok(callback.includes("requestedScopes"));
  assert.ok(callback.includes("missingScopes"));
});
