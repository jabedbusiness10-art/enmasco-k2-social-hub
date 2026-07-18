import { linkedinRequest, organizationUrn } from "./client";
import { safeWebsiteFetch, readLimitedBody } from "@/services/website/security";
import { IntegrationError } from "@/services/integrations/errors";

interface ExternalMedia {
  bytes: Uint8Array;
  contentType: string;
}

async function fetchExternalMedia(url: string, kind: "image" | "video"): Promise<ExternalMedia> {
  let response: Response;
  try {
    response = await safeWebsiteFetch(url, {}, { timeoutMs: 20_000 });
  } catch {
    throw new IntegrationError("LINKEDIN", "MEDIA_UPLOAD_FAILED", "Media asset could not be fetched securely", 422, true, "Verify that the Media Library asset has a public HTTPS URL.");
  }
  if (!response.ok) throw new IntegrationError("LINKEDIN", "MEDIA_UPLOAD_FAILED", `Media asset returned HTTP ${response.status}`, 422, true, "Verify the Media Library asset URL.");
  const contentType = (response.headers.get("content-type") ?? "").split(";")[0].toLowerCase();
  if (!contentType.startsWith(`${kind}/`)) throw new IntegrationError("LINKEDIN", "MEDIA_UPLOAD_FAILED", `LinkedIn ${kind} upload received unsupported media type`, 415, false, `Use a supported ${kind} file.`);
  const maxBytes = kind === "image" ? 20 * 1024 * 1024 : 500 * 1024 * 1024;
  const bytes = await readLimitedBody(response, maxBytes).catch(() => {
    throw new IntegrationError("LINKEDIN", "MEDIA_UPLOAD_FAILED", `${kind} exceeds the configured upload limit`, 413, false, `Reduce the ${kind} file size.`);
  });
  return { bytes, contentType };
}

async function pollAssetStatus(accessToken: string, endpoint: "images" | "videos", urn: string) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const { data } = await linkedinRequest<any>(`/${endpoint}/${encodeURIComponent(urn)}`, accessToken, {}, { retries: 0 });
    const status = String(data?.status ?? data?.processingStatus ?? "AVAILABLE").toUpperCase();
    if (["AVAILABLE", "READY", "PROCESSING_COMPLETE"].includes(status)) return;
    if (["FAILED", "PROCESSING_FAILED", "ERROR"].includes(status)) {
      throw new IntegrationError("LINKEDIN", "MEDIA_UPLOAD_FAILED", `LinkedIn ${endpoint === "images" ? "image" : "video"} processing failed`, 422, true, "Retry the media upload.");
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new IntegrationError("LINKEDIN", "MEDIA_UPLOAD_FAILED", "LinkedIn media processing did not complete in time", 503, true, "Retry publishing after the provider finishes processing.");
}

export async function uploadLinkedInImage(accessToken: string, organizationId: string, sourceUrl: string): Promise<string> {
  const media = await fetchExternalMedia(sourceUrl, "image");
  const { data } = await linkedinRequest<any>("/images?action=initializeUpload", accessToken, {
    method: "POST",
    body: JSON.stringify({ initializeUploadRequest: { owner: organizationUrn(organizationId) } }),
  });
  const uploadUrl = data?.value?.uploadUrl;
  const image = data?.value?.image;
  if (!uploadUrl || !image) throw new IntegrationError("LINKEDIN", "MEDIA_UPLOAD_FAILED", "LinkedIn did not initialize the image upload", 502, true, "Retry the image upload.");
  const upload = await safeWebsiteFetch(uploadUrl, { method: "PUT", headers: { "Content-Type": media.contentType }, body: Buffer.from(media.bytes) }, { timeoutMs: 30_000 });
  if (!upload.ok) throw new IntegrationError("LINKEDIN", "MEDIA_UPLOAD_FAILED", `LinkedIn image upload returned HTTP ${upload.status}`, 502, true, "Retry the image upload.");
  await pollAssetStatus(accessToken, "images", image);
  return image;
}

export async function uploadLinkedInVideo(accessToken: string, organizationId: string, sourceUrl: string): Promise<string> {
  const media = await fetchExternalMedia(sourceUrl, "video");
  if (media.contentType !== "video/mp4") throw new IntegrationError("LINKEDIN", "MEDIA_UPLOAD_FAILED", "LinkedIn organization video publishing requires MP4", 415, false, "Convert the video to MP4.");
  const { data } = await linkedinRequest<any>("/videos?action=initializeUpload", accessToken, {
    method: "POST",
    body: JSON.stringify({ initializeUploadRequest: { owner: organizationUrn(organizationId), fileSizeBytes: media.bytes.byteLength, uploadCaptions: false, uploadThumbnail: false } }),
  });
  const value = data?.value;
  const video = value?.video;
  const instructions = Array.isArray(value?.uploadInstructions) ? value.uploadInstructions : [];
  if (!video || !instructions.length) throw new IntegrationError("LINKEDIN", "MEDIA_UPLOAD_FAILED", "LinkedIn did not initialize the video upload", 502, true, "Retry the video upload.");
  const uploadedPartIds: string[] = [];
  for (const instruction of instructions) {
    const first = Number(instruction.firstByte);
    const last = Number(instruction.lastByte);
    const chunk = Buffer.from(media.bytes.slice(first, Math.min(media.bytes.byteLength, last + 1)));
    const response = await safeWebsiteFetch(instruction.uploadUrl, { method: "PUT", headers: { "Content-Type": "application/octet-stream" }, body: chunk }, { timeoutMs: 30_000 });
    if (!response.ok) throw new IntegrationError("LINKEDIN", "MEDIA_UPLOAD_FAILED", `LinkedIn video part upload returned HTTP ${response.status}`, 502, true, "Retry the video upload.");
    const etag = response.headers.get("etag");
    if (!etag) throw new IntegrationError("LINKEDIN", "MEDIA_UPLOAD_FAILED", "LinkedIn video upload did not return a part identifier", 502, true, "Retry the video upload.");
    uploadedPartIds.push(etag);
  }
  await linkedinRequest<any>("/videos?action=finalizeUpload", accessToken, {
    method: "POST",
    body: JSON.stringify({ finalizeUploadRequest: { video, uploadToken: value.uploadToken ?? "", uploadedPartIds } }),
  });
  await pollAssetStatus(accessToken, "videos", video);
  return video;
}
