import assert from "node:assert/strict";
import test from "node:test";
import { assessLinkedInScopes } from "../../services/linkedin/oauth";
import { getWebsiteProvider } from "../../services/website/providers";
import { IntegrationError } from "../../services/integrations/errors";

test("LinkedIn capability assessment reports approved and missing products honestly", () => {
  const assessment = assessLinkedInScopes(["openid", "profile", "rw_organization_admin", "w_organization_social"]);
  assert.equal(assessment.capabilities.identity, true);
  assert.equal(assessment.capabilities.organizationDiscovery, true);
  assert.equal(assessment.capabilities.publishPosts, true);
  assert.equal(assessment.capabilities.readPosts, false);
  assert.deepEqual(assessment.missing.readPosts, ["r_organization_social", "r_organization_social_feed"]);
});

test("read-only website providers never simulate publishing", async () => {
  for (const kind of ["RSS", "SITEMAP", "STATIC"] as const) {
    const provider = getWebsiteProvider(kind);
    assert.equal(provider.capabilities.publish, false);
    await assert.rejects(
      provider.publish({ baseUrl: "https://example.com" }, { title: "x", content: "x", status: "draft" }),
      (error: unknown) => error instanceof IntegrationError && error.code === "READ_ONLY_PROVIDER",
    );
  }
});

test("WordPress and REST providers advertise real publish capability", () => {
  assert.equal(getWebsiteProvider("WORDPRESS").capabilities.publish, true);
  assert.equal(getWebsiteProvider("REST_API").capabilities.publish, true);
  assert.equal(getWebsiteProvider("WEBHOOK").capabilities.sync, false);
});
