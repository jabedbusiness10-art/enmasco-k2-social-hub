import * as crypto from "crypto";

/**
 * TASK-46 — LinkedIn OAuth 2.0 service (Organization / Company Pages).
 *
 * Uses the latest LinkedIn REST API (api.linkedin.com/rest with the
 * `LinkedIn-Version` header). Mirrors services/meta/oauth.ts so both
 * providers reuse the same connection-storage layer in
 * services/social/accounts.ts.
 */

const LINKEDIN_AUTH_BASE = "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const LINKEDIN_API_BASE = "https://api.linkedin.com/rest";
export const LINKEDIN_API_VERSION = "202504";

export const LINKEDIN_SCOPES = [
  "r_organization_social",
  "rw_organization_admin",
  "w_member_social",
  "r_basicprofile",
].join(",");

export interface LinkedInEnv {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export function getLinkedInEnv(): LinkedInEnv {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "LinkedIn OAuth is not configured. Set LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_REDIRECT_URI in .env.local",
    );
  }
  return { clientId, clientSecret, redirectUri };
}

export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function buildAuthUrl(state: string): string {
  const { clientId, redirectUri } = getLinkedInEnv();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: LINKEDIN_SCOPES,
  });
  return `${LINKEDIN_AUTH_BASE}?${params.toString()}`;
}

export interface LinkedInTokenResponse {
  access_token: string;
  expires_in?: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope?: string;
  token_type?: string;
}

export async function exchangeCodeForToken(code: string): Promise<LinkedInTokenResponse> {
  const { clientId, clientSecret, redirectUri } = getLinkedInEnv();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetch(LINKEDIN_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(data?.error_description ?? data?.error ?? "LinkedIn token exchange failed");
  }
  return data as LinkedInTokenResponse;
}

export async function refreshAccessToken(refreshToken: string): Promise<LinkedInTokenResponse> {
  const { clientId, clientSecret } = getLinkedInEnv();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetch(LINKEDIN_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(data?.error_description ?? data?.error ?? "LinkedIn token refresh failed");
  }
  return data as LinkedInTokenResponse;
}

export interface LinkedInOrganization {
  id: string;
  name: string;
  localizedName?: string;
  logoUrl?: string;
  vanityName?: string;
}

function parseOrgId(org: any): string {
  if (typeof org === "string") return String(org.split(":").pop() ?? "");
  return String(org?.id ?? "");
}

export async function getOrganizations(accessToken: string): Promise<LinkedInOrganization[]> {
  const res = await fetch(
    `${LINKEDIN_API_BASE}/memberOrganizationAcls?q=roleAssignee&projection=(elements*(organization*(id,localizedName,vanityName,logoV2(original~:playableStreams))))`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "LinkedIn-Version": LINKEDIN_API_VERSION,
        "X-Restli-Protocol-Version": "2.0.0",
      },
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.elements) {
    throw new Error(data?.message ?? "Failed to fetch LinkedIn organizations");
  }
  return data.elements
    .map((el: any) => {
      const org = el?.organization ?? {};
      const id = parseOrgId(org);
      const logoEl =
        org?.logoV2?.original?.["com.linkedin.common.VectorImage"]?.rootUrl ?? null;
      return {
        id,
        name: org.localizedName ?? org.name ?? "LinkedIn Organization",
        localizedName: org.localizedName,
        vanityName: org.vanityName,
        logoUrl: logoEl,
      } as LinkedInOrganization;
    })
    .filter((o: LinkedInOrganization) => o.id);
}

export async function getOrganization(
  accessToken: string,
  organizationId: string,
): Promise<LinkedInOrganization> {
  const res = await fetch(
    `${LINKEDIN_API_BASE}/organizations/${organizationId}?projection=(id,localizedName,vanityName,logoV2(original~:playableStreams))`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "LinkedIn-Version": LINKEDIN_API_VERSION,
        "X-Restli-Protocol-Version": "2.0.0",
      },
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message ?? "Failed to fetch LinkedIn organization");
  }
  const logoEl =
    data?.logoV2?.original?.["com.linkedin.common.VectorImage"]?.rootUrl ?? null;
  return {
    id: String(data.id ?? organizationId),
    name: data.localizedName ?? data.name ?? "LinkedIn Organization",
    localizedName: data.localizedName,
    vanityName: data.vanityName,
    logoUrl: logoEl,
  };
}

export interface LinkedInConnectionTest {
  ok: boolean;
  steps: { name: string; ok: boolean; detail?: string }[];
}

export async function testLinkedInConnection(
  accessToken: string,
): Promise<LinkedInConnectionTest> {
  const steps: LinkedInConnectionTest["steps"] = [];
  try {
    const res = await fetch(
      `${LINKEDIN_API_BASE}/me?projection=(id,localizedFirstName,localizedLastName)`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "LinkedIn-Version": LINKEDIN_API_VERSION,
          "X-Restli-Protocol-Version": "2.0.0",
        },
      },
    );
    const data = await res.json().catch(() => ({}));
    steps.push({
      name: "LinkedIn Profile Access",
      ok: res.ok && !!data.id,
      detail: data?.message ?? (res.ok ? `Member ${data.id}` : undefined),
    });
  } catch (e: any) {
    steps.push({ name: "LinkedIn Profile Access", ok: false, detail: e.message });
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
