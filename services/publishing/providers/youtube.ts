import { safeWebsiteFetch, readLimitedBody } from "@/services/website/security";
import type { PublishInput, PublishResult } from "../engine";

const YOUTUBE_API = "https://www.googleapis.com/youtube/v3";
const YOUTUBE_UPLOAD = "https://www.googleapis.com/upload/youtube/v3";

function failed(error: string, errorCode: string, retryable = false): PublishResult {
  return { platform: "YOUTUBE", ok: false, error, errorCode, retryable, providerStatus: "FAILED" };
}

async function googleJson(url: string, token: string, init: RequestInit = {}) {
  const response = await fetch(url, { ...init, headers: { Authorization: `Bearer ${token}`, ...(init.headers ?? {}) } });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

export async function publishYouTube(
  account: any,
  accessToken: string,
  input: PublishInput,
): Promise<PublishResult> {
  const videoUrl = input.mediaUrls?.find((url) => /\.(mp4|mov|webm)(?:\?|$)/i.test(url));
  if (!videoUrl) return failed("YouTube publishing requires one video", "VIDEO_REQUIRED");

  const options = input.providerOptions?.youtube;
  const visibility = options?.visibility ?? "private";
  const publishAt = options?.publishAt;
  if (publishAt && visibility !== "private") {
    return failed("YouTube scheduled publishing requires private visibility until publish time", "INVALID_SCHEDULE_VISIBILITY");
  }

  let mediaResponse: Response;
  try {
    mediaResponse = await safeWebsiteFetch(videoUrl, {}, { timeoutMs: 30_000 });
  } catch {
    return failed("YouTube video could not be fetched securely", "MEDIA_FETCH_FAILED", true);
  }
  if (!mediaResponse.ok) return failed(`YouTube video source returned HTTP ${mediaResponse.status}`, "MEDIA_FETCH_FAILED", true);
  const contentType = (mediaResponse.headers.get("content-type") ?? "video/mp4").split(";")[0];
  if (!contentType.startsWith("video/")) return failed("YouTube upload source is not a video", "INVALID_MEDIA_TYPE");
  let bytes: Uint8Array;
  try {
    bytes = await readLimitedBody(mediaResponse, 512 * 1024 * 1024);
  } catch {
    return failed("YouTube video exceeds the configured 512 MB upload limit", "MEDIA_TOO_LARGE");
  }

  const metadata = {
    snippet: {
      title: (options?.title ?? input.title ?? "Untitled video").slice(0, 100),
      description: (options?.description ?? input.caption).slice(0, 5_000),
      tags: options?.tags ?? input.hashtags ?? [],
      categoryId: options?.categoryId ?? "22",
    },
    status: {
      privacyStatus: visibility,
      selfDeclaredMadeForKids: options?.madeForKids ?? false,
      ...(publishAt ? { publishAt } : {}),
    },
  };

  const init = await fetch(`${YOUTUBE_UPLOAD}/videos?uploadType=resumable&part=snippet,status`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": contentType,
      "X-Upload-Content-Length": String(bytes.byteLength),
    },
    body: JSON.stringify(metadata),
  });
  if (!init.ok) {
    const data = await init.json().catch(() => ({}));
    const message = String(data?.error?.message ?? "YouTube upload could not be initialized");
    return failed(message, init.status === 403 ? "PERMISSION_OR_QUOTA_DENIED" : "UPLOAD_INIT_FAILED", init.status === 429 || init.status >= 500);
  }
  const uploadUrl = init.headers.get("location");
  if (!uploadUrl) return failed("YouTube did not return a resumable upload URL", "UPLOAD_INIT_FAILED", true);

  const upload = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": contentType, "Content-Length": String(bytes.byteLength) }, body: Buffer.from(bytes) });
  const uploaded = await upload.json().catch(() => ({}));
  const videoId = uploaded?.id;
  if (!upload.ok || !videoId) return failed(String(uploaded?.error?.message ?? "YouTube video upload failed"), "UPLOAD_FAILED", upload.status === 429 || upload.status >= 500);

  if (options?.thumbnailUrl) {
    try {
      const thumbResponse = await safeWebsiteFetch(options.thumbnailUrl, {}, { timeoutMs: 15_000 });
      const thumbType = (thumbResponse.headers.get("content-type") ?? "image/jpeg").split(";")[0];
      const thumb = await readLimitedBody(thumbResponse, 2 * 1024 * 1024);
      await fetch(`${YOUTUBE_UPLOAD}/thumbnails/set?videoId=${encodeURIComponent(videoId)}&uploadType=media`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": thumbType },
        body: Buffer.from(thumb),
      });
    } catch { /* Thumbnail failure must not invalidate a successful video upload. */ }
  }

  if (options?.playlistId) {
    await googleJson(`${YOUTUBE_API}/playlistItems?part=snippet`, accessToken, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snippet: { playlistId: options.playlistId, resourceId: { kind: "youtube#video", videoId } } }),
    });
  }

  const processing = await googleJson(`${YOUTUBE_API}/videos?part=status,processingDetails&id=${encodeURIComponent(videoId)}`, accessToken);
  const item = processing.data?.items?.[0];
  const providerStatus = String(item?.processingDetails?.processingStatus ?? item?.status?.uploadStatus ?? "PROCESSING").toUpperCase();
  return {
    platform: "YOUTUBE",
    ok: true,
    platformPostId: String(videoId),
    liveUrl: `https://youtu.be/${videoId}`,
    providerStatus,
    metadata: { channelId: account.accountId ?? null, visibility, publishAt: publishAt ?? null, playlistId: options?.playlistId ?? null },
  };
}
