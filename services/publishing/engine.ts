import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto";

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
const LINKEDIN_API = "https://api.linkedin.com/rest";
const LINKEDIN_VERSION = "202504";

export interface PublishTarget {
  platform: "FACEBOOK" | "INSTAGRAM" | "LINKEDIN";
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
}

export interface PublishResult {
  platform: string;
  ok: boolean;
  platformPostId?: string;
  liveUrl?: string;
  error?: string;
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
  const token = acc.accessToken ? decrypt(acc.accessToken) : null;
  if (!token) throw new Error("Missing access token");
  return { acc, token };
}

async function publishFacebook(acc: any, token: string, input: PublishInput): Promise<PublishResult> {
  const pageId = acc.pageId;
  if (!pageId) return { platform: "FACEBOOK", ok: false, error: "No Facebook Page linked" };
  const body = new URLSearchParams({
    message: fullCaption(input),
    access_token: token,
  });
  if (input.link) body.set("link", input.link);
  if (input.mediaUrls?.length) body.set("picture", input.mediaUrls[0]);
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
  if (!input.mediaUrls?.length) {
    return { platform: "INSTAGRAM", ok: false, error: "Instagram requires an image or video" };
  }
  // 1. create media object
  const isVideo = /\.(mp4|mov|webm)$/i.test(input.mediaUrls[0]);
  const createBody = new URLSearchParams({
    access_token: token,
    caption: fullCaption(input),
  });
  if (isVideo) {
    createBody.set("media_type", "VIDEO");
    createBody.set("video_url", input.mediaUrls[0]);
  } else {
    createBody.set("image_url", input.mediaUrls[0]);
  }
  const cRes = await fetch(`${META_GRAPH}/${igId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: createBody,
  });
  const cData = await cRes.json().catch(() => ({}));
  if (!cRes.ok || !cData.id) {
    return { platform: "INSTAGRAM", ok: false, error: cData?.error?.message ?? "IG media creation failed" };
  }
  // 2. publish
  const pRes = await fetch(`${META_GRAPH}/${igId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ access_token: token, creation_id: cData.id }),
  });
  const pData = await pRes.json().catch(() => ({}));
  if (!pRes.ok || !pData.id) {
    return { platform: "INSTAGRAM", ok: false, error: pData?.error?.message ?? "IG publish failed" };
  }
  return {
    platform: "INSTAGRAM",
    ok: true,
    platformPostId: pData.id,
    liveUrl: `https://instagram.com/p/${pData.id}`,
  };
}

async function publishLinkedIn(acc: any, token: string, input: PublishInput): Promise<PublishResult> {
  const orgId = acc.organizationId;
  if (!orgId) return { platform: "LINKEDIN", ok: false, error: "No LinkedIn Organization linked" };
  const author = `urn:li:organization:${orgId}`;
  const text = fullCaption(input);
  const payload: any = {
    author,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text },
        shareMediaCategory: "NONE",
      },
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
  };
  if (input.mediaUrls?.length) {
    payload.specificContent["com.linkedin.ugc.ShareContent"].shareMediaCategory = "IMAGE";
    payload.specificContent["com.linkedin.ugc.ShareContent"].media = input.mediaUrls.map((u, i) => ({
      status: "READY",
      description: { text: input.title ?? "" },
      media: u,
      title: { text: input.title ?? `Image ${i + 1}` },
    }));
  }
  const res = await fetch(`${LINKEDIN_API}/ugcPosts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
      "LinkedIn-Version": LINKEDIN_VERSION,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.id) {
    return { platform: "LINKEDIN", ok: false, error: data?.message ?? "LinkedIn publish failed" };
  }
  return {
    platform: "LINKEDIN",
    ok: true,
    platformPostId: data.id,
    liveUrl: `https://www.linkedin.com/feed/update/${data.id}`,
  };
}

/** Publish to ONE platform using a stored connected account. Real API call. */
export async function publishToPlatform(
  target: PublishTarget,
  input: PublishInput,
): Promise<PublishResult> {
  const { acc, token } = await resolveAccount(target.accountId);
  switch (target.platform) {
    case "FACEBOOK":
      return publishFacebook(acc, token, input);
    case "INSTAGRAM":
      return publishInstagram(acc, token, input);
    case "LINKEDIN":
      return publishLinkedIn(acc, token, input);
    default:
      return { platform: target.platform, ok: false, error: "Unsupported platform" };
  }
}
