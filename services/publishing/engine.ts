import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { classifyMetaError } from "@/services/meta/oauth";
import { publishLinkedInOrganization } from "@/services/linkedin/posts";
import { publishWebsiteConnection } from "@/services/website/connection";
import { publishTikTok } from "./providers/tiktok";
import { publishYouTube } from "./providers/youtube";

/**
 * TASK-48 — Enterprise Real Publishing Engine.
 *
 * Publishes REAL content to connected Meta (Facebook Page + Instagram Business)
 * and LinkedIn Company Pages using the encrypted access tokens stored in
 * CompanySocialAccount. No mock publishing: every call hits the live platform
 * Graph / REST API and returns the real platform post id + permalink.
 *
 * Tokens are decrypted server-side and NEVER returned to the client.
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

async function publishFacebook(acc: any, token: string, input: PublishInput): Promise<PublishResult> {
  const pageId = acc.pageId;
  if (!pageId) return { platform: "FACEBOOK", ok: false, error: "No Facebook Page linked" };
  const media = input.mediaUrls ?? [];
  const body = new URLSearchParams({
    message: fullCaption(input),
    access_token: token,
  });
  const singleVideo = media.length === 1 && /\.(mp4|mov|webm)(?:\?|$)/i.test(media[0]);
  if (singleVideo) {
    const response = await fetch(`${META_GRAPH}/${pageId}/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ access_token: token, file_url: media[0], description: fullCaption(input) }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.id) {
      return { platform: "FACEBOOK", ok: false, error: data?.error?.message ?? "Facebook video publish failed", retryable: response.status === 429 || response.status >= 500 };
    }
    return { platform: "FACEBOOK", ok: true, platformPostId: data.id, liveUrl: `https://facebook.com/${data.id}`, providerStatus: "PROCESSING" };
  }
  if (input.link) body.set("link", input.link);
  // TASK-74 — multi-image carousel via attached_media (real Graph feature).
  if (media.length >= 2) {
    const attached: string[] = [];
    for (const url of media.slice(0, 10)) {
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
  } else if (media.length === 1) {
    body.set("picture", media[0]);
  }
  const res = await fetch(`${META_GRAPH}/${pageId}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.id) {
    return { platform: "FACEBOOK", ok: false, error: data?.error?.message ?? "Facebook publish failed" };
  }
  return {
    platform: "FACEBOOK",
    ok: true,
    platformPostId: data.id,
    liveUrl: `https://facebook.com/${data.id}`,
  };
}

async function publishInstagram(acc: any, token: string, input: PublishInput): Promise<PublishResult> {
  const igId = acc.instagramBusinessId;
  if (!igId) return { platform: "INSTAGRAM", ok: false, error: "No Instagram Business account linked" };
  const media = input.mediaUrls ?? [];
  if (!media.length) {
    return { platform: "INSTAGRAM", ok: false, error: "Instagram requires an image or video" };
  }
  const isVideo = /\.(mp4|mov|webm)$/i.test(media[0]);
  const caption = fullCaption(input);

  // Single media (image or video)
  if (media.length === 1) {
    const createBody = new URLSearchParams({ access_token: token, caption });
    if (isVideo) {
      createBody.set("media_type", "REELS");
      createBody.set("video_url", media[0]);
    } else {
      createBody.set("image_url", media[0]);
    }
    return igPublish(igId, token, createBody);
  }

  // TASK-74 — carousel via children (real Graph feature).
  const children: string[] = [];
  for (const url of media.slice(0, 10)) {
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
