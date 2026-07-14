import * as crypto from "crypto";

/**
 * TASK-45 — Meta OAuth service (Facebook + Instagram Business).
 *
 * Reusable for future providers (TASK-46 LinkedIn, etc.) — only the
 * provider-specific pieces live here; the connection-storage layer is in
 * services/social/accounts.ts so other integrations can reuse it.
 */

const META_AUTH_BASE = "https://www.facebook.com/v21.0/dialog/oauth";
const META_TOKEN_URL = "https://graph.facebook.com/v21.0/oauth/access_token";
const META_GRAPH_BASE = "https://graph.facebook.com/v21.0";

export const META_SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "public_profile",
].join(",");

export interface MetaEnv {
  appId: string;
  appSecret: string;
  redirectUri: string;
}

export function getMetaEnv(): MetaEnv {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = process.env.META_REDIRECT_URI;
  if (!appId || !appSecret || !redirectUri) {
    throw new Error(
      "Meta OAuth is not configured. Set META_APP_ID, META_APP_SECRET, META_REDIRECT_URI in .env.local",
    );
  }
  return { appId, appSecret, redirectUri };
}

/** Generate a cryptographically random OAuth state token. */
export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString("hex");
}

/** Build the Meta authorization URL. `state` must be validated on callback. */
export function buildAuthUrl(state: string): string {
  const { appId, redirectUri } = getMetaEnv();
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    scope: META_SCOPES,
    response_type: "code",
  });
  return `${META_AUTH_BASE}?${params.toString()}`;
}

export interface MetaTokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number; // seconds
}

/** Exchange an authorization code for a short-lived User access token. */
export async function exchangeCodeForToken(code: string): Promise<MetaTokenResponse> {
  const { appId, appSecret, redirectUri } = getMetaEnv();
  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code,
  });
  const res = await fetch(`${META_TOKEN_URL}?${params.toString()}`, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(data?.error?.message ?? "Meta token exchange failed");
  }
  return data as MetaTokenResponse;
}

/** Exchange a short-lived token for a long-lived (~60 day) User token. */
export async function getLongLivedToken(shortLived: string): Promise<MetaTokenResponse> {
  const { appId, appSecret } = getMetaEnv();
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortLived,
  });
  const res = await fetch(`${META_TOKEN_URL}?${params.toString()}`, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(data?.error?.message ?? "Failed to exchange long-lived token");
  }
  return data as MetaTokenResponse;
}

export interface MetaPage {
  id: string;
  name: string;
  access_token: string; // page-scoped token
  category?: string;
  tasks?: string[];
}

/** List Facebook Pages the user manages (with page-scoped tokens). */
export async function getPages(userToken: string): Promise<MetaPage[]> {
  const res = await fetch(
    `${META_GRAPH_BASE}/me/accounts?fields=id,name,access_token,category,tasks&limit=100`,
    { headers: { Authorization: `Bearer ${userToken}` } },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.data) {
    throw new Error(data?.error?.message ?? "Failed to fetch Facebook Pages");
  }
  return data.data as MetaPage[];
}

export interface MetaInstagramBusiness {
  id: string; // IG user/business id
  username?: string;
  name?: string;
  profile_picture_url?: string;
}

/** Fetch the Instagram Business account linked to a Facebook Page. */
export async function getInstagramBusiness(
  pageId: string,
  pageToken: string,
): Promise<MetaInstagramBusiness | null> {
  const res = await fetch(
    `${META_GRAPH_BASE}/${pageId}?fields=instagram_business_account{id,username,name,profile_picture_url}`,
    { headers: { Authorization: `Bearer ${pageToken}` } },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message ?? "Failed to fetch Instagram Business account");
  }
  const ig = data?.instagram_business_account;
  return ig ? (ig as MetaInstagramBusiness) : null;
}

export interface MetaTokenDebug {
  app_id?: string;
  type?: string;
  application?: string;
  expires_at?: number; // unix seconds (0 = never)
  scopes?: string[];
  granted_scopes?: string[];
  is_valid?: boolean;
  error?: { message?: string };
}

/** Debug a token: validity, expiry, granted scopes (used for test-connection). */
export async function debugToken(inputToken: string): Promise<MetaTokenDebug> {
  const { appId, appSecret } = getMetaEnv();
  const appToken = `${appId}|${appSecret}`;
  const params = new URLSearchParams({
    input_token: inputToken,
    access_token: appToken,
  });
  const res = await fetch(`${META_GRAPH_BASE}/debug_token?${params.toString()}`, {
    method: "GET",
  });
  const data = await res.json().catch(() => ({}));
  const dbg = data?.data ?? {};
  return {
    app_id: dbg.app_id,
    type: dbg.type,
    application: dbg.application,
    expires_at: dbg.expires_at,
    scopes: dbg.scopes,
    granted_scopes: dbg.granted_scopes,
    is_valid: dbg.is_valid,
    error: data?.error,
  };
}

export interface MetaConnectionTest {
  ok: boolean;
  steps: { name: string; ok: boolean; detail?: string }[];
}

/** End-to-end connection test for a stored Facebook Page + IG Business token. */
export async function testMetaConnection(opts: {
  pageToken: string;
  igToken?: string;
}): Promise<MetaConnectionTest> {
  const steps: MetaConnectionTest["steps"] = [];

  // 1. FB page access
  try {
    const res = await fetch(`${META_GRAPH_BASE}/me?fields=id,name`, {
      headers: { Authorization: `Bearer ${opts.pageToken}` },
    });
    const data = await res.json().catch(() => ({}));
    steps.push({
      name: "Facebook Page Access",
      ok: res.ok && !!data.id,
      detail: data?.error?.message ?? (res.ok ? `Page id ${data.id}` : undefined),
    });
  } catch (e: any) {
    steps.push({ name: "Facebook Page Access", ok: false, detail: e.message });
  }

  // 2. IG business access (if token provided)
  if (opts.igToken) {
    try {
      const res = await fetch(`${META_GRAPH_BASE}/me?fields=id,username`, {
        headers: { Authorization: `Bearer ${opts.igToken}` },
      });
      const data = await res.json().catch(() => ({}));
      steps.push({
        name: "Instagram Business Access",
        ok: res.ok && !!data.id,
        detail: data?.error?.message ?? (res.ok ? `IG @${data.username}` : undefined),
      });
    } catch (e: any) {
      steps.push({ name: "Instagram Business Access", ok: false, detail: e.message });
    }
  }

  // 3. API availability (Graph reachable)
  steps.push({
    name: "Meta Graph API Availability",
    ok: steps.every((s) => s.ok || s.name !== "Facebook Page Access"),
    detail: "Graph API responded",
  });

  return { ok: steps.every((s) => s.ok), steps };
}

/** Compute token expiry + high-level status from a long-lived token response. */
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
