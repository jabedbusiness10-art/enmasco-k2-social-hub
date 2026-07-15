import * as crypto from "crypto";

/**
 * TASK-57 — YouTube OAuth 2.0 service (Google Cloud Console).
 *
 * Uses Google's OAuth 2.0 authorization-code flow against the
 * YouTube Data API v3. Mirrors services/meta/oauth.ts and
 * services/linkedin/oauth.ts so all providers reuse the same
 * connection-storage layer in services/social/accounts.ts.
 */

const GOOGLE_AUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

// Force approval prompt so a refresh token is always returned (needed for
// offline access / token refresh later).
const YOUTUBE_SCOPES = [
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube.upload",
].join(" ");

export interface GoogleEnv {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export function getGoogleEnv(): GoogleEnv {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "YouTube (Google) OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI in .env.local",
    );
  }
  return { clientId, clientSecret, redirectUri };
}

/** Generate a cryptographically random OAuth state token (CSRF defence). */
export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString("hex");
}

/** Build the Google authorization URL. `state` must be validated on callback. */
export function buildAuthUrl(state: string): string {
  const { clientId, redirectUri } = getGoogleEnv();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: YOUTUBE_SCOPES,
    state,
    access_type: "offline", // request a refresh token
    include_granted_scopes: "true",
    prompt: "consent", // always show consent so refresh token is issued
  });
  return `${GOOGLE_AUTH_BASE}?${params.toString()}`;
}

export interface GoogleTokenResponse {
  access_token: string;
  expires_in?: number; // seconds
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  id_token?: string;
}

/** Exchange an authorization code for an access token (+ refresh token). */
export async function exchangeCodeForToken(code: string): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret, redirectUri } = getGoogleEnv();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(data?.error_description ?? data?.error ?? "YouTube token exchange failed");
  }
  return data as GoogleTokenResponse;
}

/** Refresh a stored Google access token using its refresh token. */
export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret } = getGoogleEnv();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(data?.error_description ?? data?.error ?? "YouTube token refresh failed");
  }
  // Google does not always return a new refresh token on refresh; keep the old one.
  return {
    ...data,
    refresh_token: data.refresh_token ?? refreshToken,
  } as GoogleTokenResponse;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  handle: string | null; // @handle (custom URL)
  customUrl: string | null;
  thumbnail: string | null;
  subscriberCount: string | null;
  viewCount: string | null;
  videoCount: string | null;
}

/**
 * Fetch the authenticated user's YouTube channel(s).
 * Uses the channels.list "mine" endpoint with snippet + statistics.
 */
export async function getChannels(accessToken: string): Promise<YouTubeChannel[]> {
  const params = new URLSearchParams({
    part: "snippet,statistics,contentDetails",
    mine: "true",
    fields:
      "items(id,snippet(title,customUrl,thumbnails(default(url))),statistics(subscriberCount,viewCount,videoCount))",
  });
  const res = await fetch(`${YOUTUBE_API_BASE}/channels?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data?.error?.errors?.[0]?.message ??
      data?.error?.message ??
      "Failed to fetch YouTube channel";
    throw new Error(msg);
  }
  const items: any[] = data.items ?? [];
  return items.map((it) => ({
    id: it.id,
    title: it.snippet?.title ?? "YouTube Channel",
    handle: it.snippet?.customUrl ?? null,
    customUrl: it.snippet?.customUrl ?? null,
    thumbnail: it.snippet?.thumbnails?.default?.url ?? null,
    subscriberCount: it.statistics?.subscriberCount ?? null,
    viewCount: it.statistics?.viewCount ?? null,
    videoCount: it.statistics?.videoCount ?? null,
  }));
}

export interface YouTubeConnectionTest {
  ok: boolean;
  steps: { name: string; ok: boolean; detail?: string }[];
}

/** Lightweight connectivity test using channels.list "mine". */
export async function testYouTubeConnection(accessToken: string): Promise<YouTubeConnectionTest> {
  const steps: YouTubeConnectionTest["steps"] = [];
  try {
    const channels = await getChannels(accessToken);
    steps.push({
      name: "YouTube Channel Access",
      ok: channels.length > 0,
      detail: channels.length ? `Channel "${channels[0].title}"` : "No channel found",
    });
  } catch (e: any) {
    steps.push({ name: "YouTube Channel Access", ok: false, detail: e.message });
  }
  return { ok: steps.every((s) => s.ok), steps };
}

export function tokenExpiryInfo(expiresInSeconds?: number): {
  expiresAt: Date | null;
  status: "ACTIVE" | "EXPIRING" | "EXPIRED";
} {
  if (!expiresInSeconds) return { expiresAt: null, status: "ACTIVE" };
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
  const days = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  const status = days <= 0 ? "EXPIRED" : days <= 7 ? "EXPIRING" : "ACTIVE";
  return { expiresAt, status };
}
