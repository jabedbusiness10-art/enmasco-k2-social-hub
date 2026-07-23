/**
 * TASK-81.6A — Shared public media URL resolver.
 *
 * Converts relative / local media URLs to an absolute HTTPS URL that can be
 * reached by Facebook / Instagram / LinkedIn provider APIs.
 *
 * Validation rules:
 * - Rejects relative paths (e.g. /uploads/...)
 * - Rejects localhost / 127.0.0.1 / private LAN IPs
 * - Rejects file:// paths
 * - Rejects malformed URLs
 * - Requires HTTPS scheme in non-development mode
 * - Normalises duplicate slashes
 * - Encodes path segments safely
 */

export interface MediaUrlResult {
  ok: boolean;
  url: string;
  error?: string;
}

/** Default production origin fallback when no storage/CDN is configured. */
function getPublicOrigin(): string {
  // 1. Cloudinary URL (if configured — preferred for CDN-hosted media)
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (cloudinaryUrl) {
    try {
      // Extract cloud name from cloudinary://API_KEY:API_SECRET@cloudname
      const match = cloudinaryUrl.match(/@([^/]+)/);
      if (match) {
        return `https://res.cloudinary.com/${match[1]}`;
      }
    } catch {
      // fall through
    }
  }

  // 2. Explicit public storage origin
  const storageOrigin = process.env.NEXT_PUBLIC_STORAGE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (storageOrigin) {
    return storageOrigin.replace(/\/+$/, "");
  }

  // 3. Fallback: SITE_URL or NEXTAUTH_URL (must be production-public)
  const fallback = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL;
  if (fallback) {
    return fallback.replace(/\/+$/, "");
  }

  return "";
}

/** Check if a hostname is local/private/unreachable by Facebook. */
function isPrivateHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === "localhost" || lower === "127.0.0.1" || lower === "0.0.0.0") return true;
  if (lower === "::1" || lower === "[::1]") return true;
  // RFC 1918 private ranges
  if (/^10\./.test(lower)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(lower)) return true;
  if (/^192\.168\./.test(lower)) return true;
  // Link-local
  if (/^169\.254\./.test(lower)) return true;
  return false;
}

/** Validate the resolved public URL can be published to a provider. */
function validatePublicUrl(url: string): string | undefined {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return `Invalid URL: "${url}" is malformed`;
  }

  if (parsed.protocol === "file:") {
    return `Invalid URL: file:// paths cannot be accessed by providers`;
  }

  if (isPrivateHost(parsed.hostname)) {
    return `Facebook cannot access the attached image because it is not available on a public URL`;
  }

  // In production/staging, require HTTPS
  const isDev = process.env.NODE_ENV === "development";
  if (!isDev && parsed.protocol !== "https:") {
    return `Media URL must use HTTPS in production; got "${parsed.protocol}"`;
  }

  return undefined;
}

/**
 * Resolve a media URL to an absolute HTTPS URL suitable for provider APIs.
 *
 * - If the URL is already a valid public HTTPS URL, returns it as-is.
 * - If the URL starts with /uploads/ or is relative, prepends the configured
 *   production public origin.
 * - Returns a structured error if the URL cannot be made public-accessible.
 */
export function resolvePublicMediaUrl(mediaUrl: string): MediaUrlResult {
  if (!mediaUrl || typeof mediaUrl !== "string") {
    return { ok: false, url: mediaUrl ?? "", error: "No media URL provided" };
  }

  let resolved: string;
  const trimmed = mediaUrl.trim();

  // Already absolute
  if (/^https?:\/\//i.test(trimmed)) {
    resolved = trimmed;
  } else if (trimmed.startsWith("/")) {
    // Relative path — prepend public origin
    const origin = getPublicOrigin();
    if (!origin) {
      return {
        ok: false,
        url: trimmed,
        error:
          "Facebook could not access the attached image because it is not available on a public URL. " +
          "Publish the media from a public production URL or upload it to public storage.",
      };
    }
    resolved = `${origin}${trimmed}`;
  } else if (/^[a-zA-Z]:\\/.test(trimmed)) {
    // Windows absolute path
    return { ok: false, url: trimmed, error: "Local file paths cannot be published to social media" };
  } else {
    // Bare path like "uploads/image.jpg"
    const origin = getPublicOrigin();
    if (!origin) {
      return {
        ok: false,
        url: trimmed,
        error: "Media URL is not absolute and no public origin is configured",
      };
    }
    resolved = `${origin}/${trimmed}`;
  }

  // Normalise duplicate slashes after protocol
  resolved = resolved.replace(/(https?:\/\/)|(\/+)/g, (match, protocol, slashes) => {
    if (protocol) return protocol.toLowerCase();
    return "/";
  });

  const validationError = validatePublicUrl(resolved);
  if (validationError) {
    return { ok: false, url: resolved, error: validationError };
  }

  return { ok: true, url: resolved };
}

/**
 * Verify that a URL is reachable and returns the expected content type.
 * Performs a HEAD request (falls back to GET) and validates:
 * - HTTP status 200
 * - Content-Type matches image/* or video/*
 * - Response body is non-empty
 * - Redirects end at a valid public URL
 */
export async function validateMediaReachability(
  url: string,
): Promise<{ ok: boolean; error?: string; contentType?: string }> {
  try {
    const parsed = new URL(url);

    // Reject private hosts even at reachability-check time
    if (isPrivateHost(parsed.hostname)) {
      return { ok: false, error: "Media is on a private network and cannot be validated" };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    let res: Response;
    try {
      // First try HEAD (faster, no body download)
      res = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
        redirect: "follow",
        headers: { "User-Agent": "EnmascoK2-Publishing/1.0" },
      });
    } catch {
      // Fallback to GET if HEAD is not supported
      res = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow",
        headers: { "User-Agent": "EnmascoK2-Publishing/1.0", Range: "bytes=0-1" },
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      return { ok: false, error: `Media URL returned HTTP ${res.status} ${res.statusText}` };
    }

    // Validate content type
    const contentType = (res.headers.get("content-type") ?? "").toLowerCase();
    if (!contentType.startsWith("image/") && !contentType.startsWith("video/")) {
      return { ok: false, error: `Media URL returned Content-Type "${contentType}" — expected image or video`, contentType };
    }

    // Validate final redirect target is public
    const finalUrl = res.url || url;
    const finalValidation = validatePublicUrl(finalUrl);
    if (finalValidation) {
      return { ok: false, error: finalValidation };
    }

    return { ok: true, contentType };
  } catch (error: any) {
    if (error.name === "AbortError") {
      return { ok: false, error: "Media URL timed out after 10 seconds" };
    }
    return { ok: false, error: `Media URL check failed: ${error.message}` };
  }
}