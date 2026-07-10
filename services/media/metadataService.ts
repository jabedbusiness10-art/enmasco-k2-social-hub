// Extracts metadata (dimensions, duration, extension) from an uploaded file.
// Provider-agnostic: works on the in-memory File before it is persisted.

export interface ExtractedMeta {
  width: number | null;
  height: number | null;
  duration: number | null;
  extension: string | null;
  mimeType: string;
}

export function detectFileType(mime: string): "IMAGE" | "VIDEO" | "DOCUMENT" | "LOGO" | "BRAND_ASSET" {
  if (mime.startsWith("image/")) {
    if (/logo|icon|brand/i.test(mime)) return "LOGO";
    return "IMAGE";
  }
  if (mime.startsWith("video/")) return "VIDEO";
  return "DOCUMENT";
}

export function extractExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

// Best-effort metadata extraction. For images we read natural dimensions via
// the browser/Image; for server uploads we rely on sharp-like probes later.
// This returns a lightweight placeholder; precise probes plug in here.
export function extractMeta(file: { name: string; type: string; size: number }): ExtractedMeta {
  return {
    width: null,
    height: null,
    duration: null,
    extension: extractExtension(file.name),
    mimeType: file.type || "application/octet-stream",
  };
}
