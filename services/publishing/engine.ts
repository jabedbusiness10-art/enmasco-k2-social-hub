import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { classifyMetaError, debugToken } from "@/services/meta/oauth";
import { publishLinkedInOrganization } from "@/services/linkedin/posts";
import { publishWebsiteConnection } from "@/services/website/connection";
import { publishTikTok } from "./providers/tiktok";
import { publishYouTube } from "./providers/youtube";
import { resolvePublicMediaUrl, validateMediaReachability } from "@/lib/media/public-url";

/**
 * TASK-48 — Enterprise Real Publishing Engine.
 *
 * Publishes REAL content to connected Meta (Facebook Page + Instagram Business)
 * and LinkedIn Company Pages using the encrypted access tokens stored in
 * CompanySocialAccount. No mock publishing: every call hits the live platform
 * Graph / REST API and returns the real platform post id + permalink.
 *
 * Tokens are decrypted server-side and NEVER returned to the client.
 *
 * TASK-81.6A — All media URLs are validated and resolved to public HTTPS URLs
 * before being sent to any provider. Relative / local / private URLs are
 * rejected early with a user-facing error.
 */

const META_GRAPH = "https://graph.facebook.com/v21.0";

export const PUBLISH_PLATFORMS = [
  "FACEBOOK", "INSTAGRAM", "TIKTOK", "YOUTUBE", "LINKEDIN", "WEBSITE",
  "X", "THREADS", "PINTEREST",
] as const;

export type PublishPlatform = (typeof PUBLISH_PLATFORMS)[number];

export interface PublishTarget {
  platform: PublishPlatform;
  accountId: string; // CompanySocialAccount id
}

export interface PublishInput {
  title?: string;
  caption: string;
  hashtags?: string[];
  link?: string;
  mediaUrls?: string[]; // image/video urls (already uploaded to storage)
  cta?: string;
  location?: string;
  providerOptions?: {
    tiktok?: {
      privacyLevel?: string;
      disableComment?: boolean;
      disableDuet?: boolean;
      disableStitch?: boolean;
      coverTimestampMs?: number;
    };
    youtube?: {
      title?: string;
      description?: string;
      thumbnailUrl?: string;
      tags?: string[];
      playlistId?: string;
      visibility?: "public" | "private" | "unlisted";
      publishAt?: string;
      categoryId?: string;
      madeForKids?: boolean;
    };
    website?: { status?: "draft" | "publish" };
  };
}

export interface PublishResult {
  platform: string;
  ok: boolean;
  platformPostId?: string;
  liveUrl?: string;
  error?: string;
  providerStatus?: string;
  retryable?: boolean;
  errorCode?: string;
  retryAfterSeconds?: number;
  metadata?: Record<string, unknown>;
}

function fullCaption(input: PublishInput): string {
  const tag = (input.hashtags ?? []).map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ");
  return [input.caption, tag].filter(Boolean).join("\n\n");
}

/** Resolve and validate all media URLs, returning resolved URLs or a failure result. */
async function resolveAndValidateMediaUrls(platform: string, mediaUrls: string[]): Promise<{ ok: true; resolved: string[] } | { ok: false; error: string }> {
  const resolved: string[] = [];
  for (const url of mediaUrls) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[publish:${platform}] original media URL: "${url}"`);
    }
    const result = resolvePublicMediaUrl(url);
    if (!result.ok) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[publish:${platform}] resolved URL: FAILED — ${result.error}`);
      }
      return { ok: false, error: result.error! };
    }
    if (process.env.NODE_ENV === "development") {
      console.log(`[publish:${platform}] resolved URL: "${result.url}"`);
    }
    resolved.push(result.url);
  }
  return { ok: true, resolved };
}

/** Decrypt the stored token for a connected account and return platform specifics. */
async function resolveAccount(accountId: string) {
  const acc = await prisma.companySocialAccount.findUnique({ where: { id: accountId } });
  if (!acc) throw new Error("Connected account not found");
  if (acc.status !== "CONNECTED") throw new Error("Account is not connected");
  // TASK-74 — proactive token refresh so publishing uses a non-expired token.
  if (acc.provider === "meta") {
    try {
      const { refreshMetaAccountIfNeeded } = await import("@/services/social/accounts");
      await refreshMetaAccountIfNeeded(accountId);
      // re-read after possible refresh
      const refreshed = await prisma.companySocialAccount.findUnique({ where: { id: accountId } });
      if (refreshed) Object.assign(acc, refreshed);
    } catch { /* refresh is best-effort; continue with stored token */ }
  }
  if (acc.provider === "youtube" && (!acc.expiresAt || acc.expiresAt.getTime() < Date.now() + 5 * 60_000)) {
    try {
      const { refreshAccount } = await import("@/services/social/accounts");
      await refreshAccount(accountId);
      const refreshed = await prisma.companySocialAccount.findUnique({ where: { id: accountId } });
      if (refreshed) Object.assign(acc, refreshed);
    } catch { /* The provider call returns the actionable auth error. */ }
  }
  const token = acc.accessToken ? decrypt(acc.accessToken) : null;
  if (!token) throw new Error("Missing access token");
  return { acc, token };
}

/**
 * TASK-81.6C — Pre-flight permission check for Facebook publishing.
 * Calls /debug_token to verify pages_manage_posts is granted before
 * making any Graph API publish call. Returns null if OK, or a
 * PublishResult with retryable=false if the permission is missing.
 */
async function checkFacebookPublishPermission(token: string): Promise<PublishResult | null> {
  try {
    const dbg = await debugToken(token);
    const granted = dbg.granted_scopes ?? dbg.scopes ?? [];
    if (!granted.includes("pages_manage_posts")) {
      return {
        platform: "FACEBOOK",
        ok: false,
        error: "Facebook publishing permission is missing. Reconnect the account after the Meta App receives access to pages_manage_posts.",
        errorCode: "PERMISSION_MISSING",
        retryable: false,
        providerStatus: "PERMISSION_MISSING",
      };
    }
    return null; // permission OK
  } catch (e: any) {
    // If debug_token itself fails (network/token invalid), let the
    // actual publish call handle it — don't block on a pre-check error.
    return null;
  }
}

async function publishFacebook(acc: any, token: string, input: PublishInput): Promise<PublishResult> {
  const pageId = acc.pageId;
  if (!pageId) return { platform: "FACEBOOK", ok: false, error: "No Facebook Page linked" };

  // TASK-81.6C — Pre-flight permission check: fail early if pages_manage_posts is missing.
  // This avoids wasting a queue retry and prevents a raw (#200) error from Meta.
  const permCheck = await checkFacebookPublishPermission(token);
  if (permCheck) return permCheck;

  const media = input.mediaUrls ?? [];

  // TASK-81.6A — Resolve and validate media URLs before sending to Meta
  if (media.length > 0) {
    const resolved = await resolveAndValidateMediaUrls("FACEBOOK", media);
    if (!resolved.ok) {
      return { platform: "FACEBOOK", ok: false, error: resolved.error, errorCode: "INVALID_MEDIA_URL", retryable: false, providerStatus: "URL_VALIDATION_FAILED" };
    }
    // Use resolved URLs for all downstream calls
    const body = new URLSearchParams({
      message: fullCaption(input),
      access_token: token,
    });
    const singleVideo = resolved.resolved.length === 1 && /\.(mp4|mov|webm)(?:\?|$)/i.test(resolved.resolved[0]);
    if (singleVideo) {
      // Video post: use /videos endpoint
      const response = await fetch(`${META_GRAPH}/${pageId}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ access_token: token, file_url: resolved.resolved[0], description: fullCaption(input) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.id) {
        const errMsg = sanitizeMetaError(data?.error?.message ?? "Facebook video publish failed");
        return { platform: "FACEBOOK", ok: false, error: errMsg, retryable: response.status === 429 || response.status >= 500 };
      }
      return { platform: "FACEBOOK", ok: true, platformPostId: data.id, liveUrl: `https://facebook.com/${data.id}`, providerStatus: "PROCESSING" };
    }
    if (input.link) body.set("link", input.link);
    // Multi-image carousel: use attached_media from /photos
    if (resolved.resolved.length >= 2) {
      const attached: string[] = [];
      for (const url of resolved.resolved.slice(0, 10)) {
        const cRes = await fetch(`${META_GRAPH}/${pageId}/photos`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ access_token: token, url, published: "false" }),
        });
        const cData = await cRes.json().catch(() => ({}));
        if (cData?.id) attached.push(cData.id);
      }
      if (attached.length) {
        attached.forEach((id, i) => body.append("attached_media", JSON.stringify({ media_fbid: id })));
      }
      const res = await fetch(`${META_GRAPH}/${pageId}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.id) {
        return { platform: "FACEBOOK", ok: false, error: sanitizeMetaError(data?.error?.message ?? "Facebook carousel publish failed") };
      }
      return { platform: "FACEBOOK", ok: true, platformPostId: data.id, liveUrl: `https://facebook.com/${data.id}` };
    }
    // Single image post: use /photos endpoint (correct Graph API approach)
    // The /photos endpoint posts an image with caption; this is the proper way
    // to publish a photo post. The `picture` field on /feed is only for link posts.
    const photoBody = new URLSearchParams({
      access_token: token,
      url: resolved.resolved[0],
      message: fullCaption(input),
    });
    const photoRes = await fetch(`${META_GRAPH}/${pageId}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: photoBody,
    });
    const photoData = await photoRes.json().catch(() => ({}));
    if (!photoRes.ok || !photoData.id) {
      return { platform: "FACEBOOK", ok: false, error: sanitizeMetaError(photoData?.error?.message ?? "Facebook photo publish failed") };
    }
    return {
      platform: "FACEBOOK",
      ok: true,
      platformPostId: photoData.id,
      liveUrl: `https://facebook.com/${photoData.id}`,
    };
  }
  // Text-only post (no media)
  const textBody = new URLSearchParams({
    message: fullCaption(input),
    access_token: token,
  });
  if (input.link) textBody.set("link", input.link);
  const res = await fetch(`${META_GRAPH}/${pageId}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: textBody,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.id) {
    return { platform: "FACEBOOK", ok: false, error: sanitizeMetaError(data?.error?.message ?? "Facebook publish failed") };
  }
  return {
    platform: "FACEBOOK",
    ok: true,
    platformPostId: data.id,
    liveUrl: `https://facebook.com/${data.id}`,
  };
}

/** Replace raw Meta error messages with user-facing text. */
function sanitizeMetaError(raw: string): string {
  if (!raw) return "Facebook publishing failed";
  // Known Meta error codes
  if (raw.includes("picture should represent a valid URL")) {
    return "Meta error code: 100 — Facebook could not access the attached image because it is not available on a public URL.";
  }
  if (raw.includes("(#100)") || raw.includes("(#200)") || raw.includes("(#10)")) {
    // Keep the code number but sanitize the message
    const codeMatch = raw.match(/\(#[0-9]+\)/);
    const code = codeMatch ? codeMatch[0] : "";
    return `Meta ${code}: ${raw.split(")").pop()?.trim() ?? raw}`;
  }
  return raw;
}

async function publishInstagram(acc: any, token: string, input: PublishInput): Promise<PublishResult> {
  const igId = acc.instagramBusinessId;
  if (!igId) return { platform: "INSTAGRAM", ok: false, error: "No Instagram Business account linked" };
  const media = input.mediaUrls ?? [];
  if (!media.length) {
    return { platform: "INSTAGRAM", ok: false, error: "Instagram requires an image or video" };
  }

  // TASK-81.6A — Resolve and validate media URLs
  const resolved = await resolveAndValidateMediaUrls("INSTAGRAM", media);
  if (!resolved.ok) {
    return { platform: "INSTAGRAM", ok: false, error: resolved.error, errorCode: "INVALID_MEDIA_URL", retryable: false, providerStatus: "URL_VALIDATION_FAILED" };
  }

  const isVideo = /\.(mp4|mov|webm)$/i.test(resolved.resolved[0]);
  const caption = fullCaption(input);

  // Single media (image or video)
  if (resolved.resolved.length === 1) {
    const createBody = new URLSearchParams({ access_token: token, caption });
    if (isVideo) {
      createBody.set("media_type", "REELS");
      createBody.set("video_url", resolved.resolved[0]);
    } else {
      createBody.set("image_url", resolved.resolved[0]);
    }
    return igPublish(igId, token, createBody);
  }

  // TASK-74 — carousel via children (real Graph feature).
  const children: string[] = [];
  for (const url of resolved.resolved.slice(0, 10)) {
    const childIsVideo = /\.(mp4|mov|webm)$/i.test(url);
    const cb = new URLSearchParams({ access_token: token, caption, is_carousel_item: "true" });
    if (childIsVideo) {
      cb.set("media_type", "VIDEO");
      cb.set("video_url", url);
    } else {
      cb.set("image_url", url);
    }
    const cRes = await fetch(`${META_GRAPH}/${igId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: cb,
    });
    const cData = await cRes.json().catch(() => ({}));
    if (cData?.id) children.push(cData.id);
  }
  if (!children.length) return { platform: "INSTAGRAM", ok: false, error: "IG carousel item creation failed" };
  const carouselBody = new URLSearchParams({
    access_token: token,
    caption,
    media_type: "CAROUSEL",
    children: children.join(","),
  });
  return igPublish(igId, token, carouselBody);
}

/** Create + publish an IG media object, returning a classified result. */
async function igPublish(igId: string, token: string, createBody: URLSearchParams): Promise<PublishResult> {
  const cRes = await fetch(`${META_GRAPH}/${igId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: createBody,
  });
  const cData = await cRes.json().catch(() => ({}));
  if (!cRes.ok || !cData.id) {
    const err = classifyMetaError(cData);
    return { platform: "INSTAGRAM", ok: false, error: `${err.message} [${err.kind}]` };
  }
  const pRes = await fetch(`${META_GRAPH}/${igId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ access_token: token, creation_id: cData.id }),
  });
  const pData = await pRes.json().catch(() => ({}));
  if (!pRes.ok || !pData.id) {
    const err = classifyMetaError(pData);
    return { platform: "INSTAGRAM", ok: false, error: `${err.message} [${err.kind}]` };
  }
  return {
    platform: "INSTAGRAM",
    ok: true,
    platformPostId: pData.id,
    liveUrl: `https://instagram.com/p/${pData.id}`,
  };
}

/** Publish to ONE platform using a stored connected account. Real API call. */
export async function publishToPlatform(
  target: PublishTarget,
  input: PublishInput,
): Promise<PublishResult> {
  if (target.platform === "LINKEDIN") {
    return publishLinkedInOrganization(target.accountId, input);
  }
  if (target.platform === "WEBSITE") {
    try {
      const result = await publishWebsiteConnection(target.accountId, {
        title: input.title || "Untitled",
        content: input.caption,
        status: input.providerOptions?.website?.status ?? "publish",
        featuredImage: input.mediaUrls?.[0],
        canonicalUrl: input.link,
        tags: input.hashtags,
      });
      return { platform: "WEBSITE", ok: true, platformPostId: result.externalId, liveUrl: result.canonicalUrl ?? undefined, providerStatus: input.providerOptions?.website?.status === "draft" ? "DRAFT" : "PUBLISHED" };
    } catch (error) {
      return { platform: "WEBSITE", ok: false, error: error instanceof Error ? error.message : "Website publishing failed" };
    }
  }
  const { acc, token } = await resolveAccount(target.accountId);
  const expectedProvider: Partial<Record<PublishPlatform, string>> = {
    FACEBOOK: "meta",
    INSTAGRAM: "meta",
    TIKTOK: "tiktok",
    YOUTUBE: "youtube",
  };
  if (expectedProvider[target.platform] && acc.provider !== expectedProvider[target.platform]) {
    return {
      platform: target.platform,
      ok: false,
      error: `Selected account is not a ${target.platform} connection`,
      errorCode: "ACCOUNT_PROVIDER_MISMATCH",
      retryable: false,
      providerStatus: "INVALID_ACCOUNT",
    };
  }
  switch (target.platform) {
    case "FACEBOOK":
      return publishFacebook(acc, token, input);
    case "INSTAGRAM":
      return publishInstagram(acc, token, input);
    case "TIKTOK":
      return publishTikTok(acc, token, input);
    case "YOUTUBE":
      return publishYouTube(acc, token, input);
    default:
      return { platform: target.platform, ok: false, error: `${target.platform} publishing adapter is not enabled yet`, errorCode: "PROVIDER_NOT_ENABLED", retryable: false, providerStatus: "NOT_ENABLED" };
  }
}