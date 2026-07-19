import type { PublishInput, PublishResult } from "../engine";

const TIKTOK_API = "https://open.tiktokapis.com/v2";

function failed(error: string, errorCode: string, retryable = false): PublishResult {
  return { platform: "TIKTOK", ok: false, error, errorCode, retryable, providerStatus: "FAILED" };
}

async function tiktokJson(path: string, token: string, body: unknown) {
  const response = await fetch(`${TIKTOK_API}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

export async function publishTikTok(
  account: any,
  accessToken: string,
  input: PublishInput,
): Promise<PublishResult> {
  const videoUrl = input.mediaUrls?.find((url) => /\.(mp4|mov|webm)(?:\?|$)/i.test(url));
  if (!videoUrl) return failed("TikTok publishing requires one video", "VIDEO_REQUIRED");

  const capabilities = (account.providerCapabilities ?? {}) as Record<string, unknown>;
  const metadata = (account.connectionMetadata ?? {}) as Record<string, unknown>;
  if (capabilities.publish === false || metadata.publishingApproved === false) {
    return failed(
      "TikTok Content Posting API approval is not available for this account. Publishing remains disabled until TikTok approves the app.",
      "APP_APPROVAL_REQUIRED",
    );
  }

  const creator = await tiktokJson("/post/publish/creator_info/query/", accessToken, {});
  const creatorError = creator.data?.error;
  if (!creator.response.ok || (creatorError?.code && creatorError.code !== "ok")) {
    const approvalMissing = creator.response.status === 401 || creator.response.status === 403 || /scope|approval|unauthorized/i.test(String(creatorError?.message ?? ""));
    return failed(
      approvalMissing
        ? "TikTok publishing permission is not approved. Reconnect after Content Posting API approval."
        : String(creatorError?.message ?? "TikTok creator account validation failed"),
      approvalMissing ? "APP_APPROVAL_REQUIRED" : "CREATOR_VALIDATION_FAILED",
      !approvalMissing && creator.response.status >= 500,
    );
  }

  const options = input.providerOptions?.tiktok;
  const allowedPrivacy: string[] = creator.data?.data?.privacy_level_options ?? [];
  const requestedPrivacy = options?.privacyLevel ?? "PUBLIC_TO_EVERYONE";
  const privacy = allowedPrivacy.length && !allowedPrivacy.includes(requestedPrivacy)
    ? allowedPrivacy[0]
    : requestedPrivacy;

  const init = await tiktokJson("/post/publish/video/init/", accessToken, {
    post_info: {
      title: [input.caption, ...(input.hashtags ?? []).map((tag) => tag.startsWith("#") ? tag : `#${tag}`)].filter(Boolean).join(" ").slice(0, 2_200),
      privacy_level: privacy,
      disable_comment: options?.disableComment ?? false,
      disable_duet: options?.disableDuet ?? false,
      disable_stitch: options?.disableStitch ?? false,
      video_cover_timestamp_ms: options?.coverTimestampMs ?? 1_000,
    },
    source_info: { source: "PULL_FROM_URL", video_url: videoUrl },
  });
  const publishId = init.data?.data?.publish_id;
  if (!init.response.ok || !publishId) {
    const code = String(init.data?.error?.code ?? "PUBLISH_INIT_FAILED");
    const approvalMissing = init.response.status === 401 || init.response.status === 403 || /scope|approval|unauthorized/i.test(code);
    return failed(
      approvalMissing ? "TikTok Content Posting API approval is required" : String(init.data?.error?.message ?? "TikTok video publishing could not be initialized"),
      approvalMissing ? "APP_APPROVAL_REQUIRED" : code,
      !approvalMissing && (init.response.status === 429 || init.response.status >= 500),
    );
  }

  const status = await tiktokJson("/post/publish/status/fetch/", accessToken, { publish_id: publishId });
  const providerStatus = String(status.data?.data?.status ?? "PROCESSING").toUpperCase();
  const failedStatus = ["FAILED", "PUBLISH_FAILED"].includes(providerStatus);
  return {
    platform: "TIKTOK",
    ok: !failedStatus,
    platformPostId: String(publishId),
    providerStatus,
    error: failedStatus ? String(status.data?.data?.fail_reason ?? "TikTok processing failed") : undefined,
    errorCode: failedStatus ? "PROCESSING_FAILED" : undefined,
    retryable: failedStatus,
    metadata: { privacyLevel: privacy, creatorId: creator.data?.data?.creator_username ?? account.accountId ?? null },
  };
}
