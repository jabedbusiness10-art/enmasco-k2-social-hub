import * as crypto from "crypto";
import { LINKEDIN_API_VERSION, linkedinRequest, organizationUrn } from "./client";
import { classifyLinkedInError, IntegrationError } from "@/services/integrations/errors";

const LINKEDIN_AUTH_BASE = "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";

const SUPPORTED_SCOPE_ALLOWLIST = new Set([
  "openid",
  "profile",
  "email",
  "w_member_social",
  "r_member_social",
  "r_organization_social",
  "w_organization_social",
  "rw_organization_admin",
  "r_organization_admin",
  "r_organization_social_feed",
]);

const SAFE_DEFAULT_SCOPES = ["openid", "profile", "email"];

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
    throw new IntegrationError("LINKEDIN", "AUTH_FAILED", "LinkedIn OAuth is not configured", 503, true, "Configure LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, and LINKEDIN_REDIRECT_URI.");
  }
  const parsed = new URL(redirectUri);
  if (parsed.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && parsed.hostname === "localhost")) {
    throw new IntegrationError("LINKEDIN", "INVALID_URL", "LinkedIn redirect URI must use HTTPS", 500, false, "Register an HTTPS callback URL in the LinkedIn Developer Portal.");
  }
  return { clientId, clientSecret, redirectUri };
}

export function getConfiguredLinkedInScopes(): string[] {
  const configured = (process.env.LINKEDIN_SCOPES ?? "")
    .split(/[\s,]+/)
    .map((scope) => scope.trim())
    .filter(Boolean);
  const requested = configured.length ? configured : SAFE_DEFAULT_SCOPES;
  const unsupported = requested.filter((scope) => !SUPPORTED_SCOPE_ALLOWLIST.has(scope));
  if (unsupported.length) {
    throw new IntegrationError("LINKEDIN", "PERMISSION_MISSING", `Unsupported LinkedIn scope configuration: ${unsupported.join(", ")}`, 500, false, "Remove unapproved or obsolete scopes from LINKEDIN_SCOPES.");
  }
  return [...new Set(requested)];
}

export const LINKEDIN_SCOPES = getConfiguredLinkedInScopes().join(" ");

export interface LinkedInScopeAssessment {
  granted: string[];
  capabilities: Record<"identity" | "organizationDiscovery" | "readPosts" | "publishPosts" | "analytics", boolean>;
  missing: Record<string, string[]>;
}

export function assessLinkedInScopes(scopes: string[]): LinkedInScopeAssessment {
  const granted = [...new Set(scopes)];
  const has = (...choices: string[]) => choices.some((scope) => granted.includes(scope));
  const requirements = {
    identity: ["openid", "profile"],
    organizationDiscovery: ["rw_organization_admin", "r_organization_admin"],
    readPosts: ["r_organization_social", "r_organization_social_feed"],
    publishPosts: ["w_organization_social"],
    analytics: ["rw_organization_admin"],
  };
  const capabilities = {
    identity: requirements.identity.every((scope) => granted.includes(scope)),
    organizationDiscovery: has(...requirements.organizationDiscovery),
    readPosts: has(...requirements.readPosts),
    publishPosts: has(...requirements.publishPosts),
    analytics: has(...requirements.analytics),
  };
  return {
    granted,
    capabilities,
    missing: Object.fromEntries(Object.entries(requirements).filter(([key]) => !capabilities[key as keyof typeof capabilities])),
  };
}

export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashOAuthState(state: string): string {
  return crypto.createHash("sha256").update(state).digest("hex");
}

export function safeStateEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function buildAuthUrl(state: string): string {
  const { clientId, redirectUri } = getLinkedInEnv();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: getConfiguredLinkedInScopes().join(" "),
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

async function tokenRequest(body: URLSearchParams): Promise<LinkedInTokenResponse> {
  let response: Response;
  try {
    response = await fetch(LINKEDIN_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    throw new IntegrationError("LINKEDIN", "NETWORK_ERROR", "LinkedIn token endpoint is unavailable", 503, true, "Retry the secure connection flow.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    throw classifyLinkedInError(response.status, data, response.headers.get("retry-after"));
  }
  return data as LinkedInTokenResponse;
}

export async function exchangeCodeForToken(code: string): Promise<LinkedInTokenResponse> {
  const { clientId, clientSecret, redirectUri } = getLinkedInEnv();
  return tokenRequest(new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri, client_id: clientId, client_secret: clientSecret }));
}

export async function refreshAccessToken(refreshToken: string): Promise<LinkedInTokenResponse> {
  const { clientId, clientSecret } = getLinkedInEnv();
  return tokenRequest(new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken, client_id: clientId, client_secret: clientSecret }));
}

export interface LinkedInOrganization {
  id: string;
  name: string;
  localizedName?: string;
  logoUrl?: string | null;
  vanityName?: string | null;
  websiteUrl?: string | null;
  industries?: string[];
  primaryOrganizationType?: string | null;
  adminRole: string;
  adminState: string;
  followerCount?: number | null;
}

function parseOrgId(value: unknown): string {
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value.split(":").pop() ?? "";
  return "";
}

export async function getOrganization(accessToken: string, organizationId: string): Promise<LinkedInOrganization> {
  const { data } = await linkedinRequest<any>(`/organizations/${encodeURIComponent(organizationId)}`, accessToken);
  const logoCandidate = data?.logoV2?.original ?? data?.logoV2?.cropped ?? null;
  return {
    id: String(data.id ?? organizationId),
    name: data.localizedName ?? data.name?.localized?.[Object.keys(data.name?.localized ?? {})[0]] ?? "LinkedIn Organization",
    localizedName: data.localizedName,
    vanityName: data.vanityName ?? null,
    logoUrl: typeof logoCandidate === "string" && /^https:\/\//i.test(logoCandidate) ? logoCandidate : null,
    websiteUrl: data.localizedWebsite ?? null,
    industries: Array.isArray(data.industries) ? data.industries : [],
    primaryOrganizationType: data.primaryOrganizationType ?? null,
    adminRole: "ADMINISTRATOR",
    adminState: "APPROVED",
    followerCount: null,
  };
}

export async function getOrganizations(accessToken: string): Promise<LinkedInOrganization[]> {
  const { data } = await linkedinRequest<any>("/organizationAcls?q=roleAssignee", accessToken);
  const accessRows = (Array.isArray(data?.elements) ? data.elements : [])
    .map((row: any) => ({
      id: parseOrgId(row.organization ?? row.organizationalTarget ?? row.organizationTarget),
      role: String(row.role ?? ""),
      state: String(row.state ?? row.roleAssigneeState ?? ""),
    }))
    .filter((row: any) => row.id && row.state === "APPROVED" && ["ADMINISTRATOR", "CONTENT_ADMIN", "DIRECT_SPONSORED_CONTENT_POSTER"].includes(row.role));

  const organizations: LinkedInOrganization[] = [];
  for (const row of accessRows.slice(0, 50)) {
    const org = await getOrganization(accessToken, row.id);
    // School pages are not company channels. Brands and ordinary organizations are allowed.
    if (org.primaryOrganizationType === "SCHOOL") continue;
    organizations.push({ ...org, adminRole: row.role, adminState: row.state });
  }
  return organizations;
}

export async function validateOrganizationAuthorization(accessToken: string, organizationId: string): Promise<boolean> {
  const { data } = await linkedinRequest<any>(`/organizationAcls?q=organization&organization=${encodeURIComponent(organizationUrn(organizationId))}`, accessToken);
  return (data?.elements ?? []).some((row: any) => row.state === "APPROVED" && ["ADMINISTRATOR", "CONTENT_ADMIN", "DIRECT_SPONSORED_CONTENT_POSTER"].includes(row.role));
}

export async function testLinkedInConnection(accessToken: string) {
  try {
    const { data } = await linkedinRequest<any>("/userinfo", accessToken, {}, { retries: 0 });
    return { ok: Boolean(data?.sub), steps: [{ name: "LinkedIn Identity", ok: Boolean(data?.sub), detail: data?.sub ? "Token validated" : "Identity unavailable" }] };
  } catch (error) {
    return { ok: false, steps: [{ name: "LinkedIn Identity", ok: false, detail: error instanceof Error ? error.message : "Validation failed" }] };
  }
}

export function tokenExpiryInfo(expiresInSeconds?: number) {
  if (!expiresInSeconds) return { expiresAt: null, status: "ACTIVE" as const };
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
  const days = (expiresAt.getTime() - Date.now()) / 86_400_000;
  return { expiresAt, status: (days <= 0 ? "EXPIRED" : days <= 7 ? "EXPIRING" : "ACTIVE") as "ACTIVE" | "EXPIRING" | "EXPIRED" };
}

export { LINKEDIN_API_VERSION };
