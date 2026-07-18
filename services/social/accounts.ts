import { prisma } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/crypto";
import type { Platform } from "@prisma/client";

export type SocialConnectionStatus =
  | "CONNECTED"
  | "EXPIRING_SOON"
  | "DISCONNECTED"
  | "PERMISSION_ERROR";

export interface SocialAccountPublic {
  id: string;
  platform: Platform;
  accountName: string;
  accountHandle: string | null;
  accountId: string | null;
  pageId: string | null;
  username: string | null;
  profileUrl: string | null;
  status: SocialConnectionStatus;
  connectedBy: string;
  lastSyncAt: string | null;
  expiresAt: string | null;
  // --- TASK-45 Meta OAuth display fields (no tokens) ---
  instagramBusinessId: string | null;
  pageName: string | null;
  permissions: string[];
  accessTokenStatus: string | null;
  provider: string | null;
  // --- TASK-46 LinkedIn OAuth display fields (no tokens) ---
  organizationId: string | null;
  organizationName: string | null;
  companyName: string | null;
  companyLogo: string | null;
  apiVersion: string | null;
  // -------------------------------------------------------
  createdAt: string;
  updatedAt: string;
}

// Derived display status (token expiry awareness) without exposing tokens.
function deriveStatus(
  status: string,
  expiresAt: Date | null,
): SocialConnectionStatus {
  if (status === "DISCONNECTED" || status === "PERMISSION_ERROR") {
    return status as SocialConnectionStatus;
  }
  if (expiresAt) {
    const daysLeft = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysLeft <= 0) return "DISCONNECTED";
    if (daysLeft <= 7) return "EXPIRING_SOON";
  }
  return "CONNECTED";
}

function toPublic(row: any): SocialAccountPublic {
  return {
    id: row.id,
    platform: row.platform,
    accountName: row.accountName,
    accountHandle: row.accountHandle,
    accountId: row.accountId,
    pageId: row.pageId,
    username: row.username,
    profileUrl: row.profileUrl,
    status: deriveStatus(row.status, row.expiresAt),
    connectedBy: row.connectedBy,
    lastSyncAt: row.lastSyncAt ? row.lastSyncAt.toISOString() : null,
    expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
    instagramBusinessId: row.instagramBusinessId ?? null,
    pageName: row.pageName ?? null,
    permissions: row.permissions ?? [],
    accessTokenStatus: row.accessTokenStatus ?? null,
    provider: row.provider ?? null,
    organizationId: row.organizationId ?? null,
    organizationName: row.organizationName ?? null,
    companyName: row.companyName ?? null,
    companyLogo: row.companyLogo ?? null,
    apiVersion: row.apiVersion ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listAccounts(): Promise<SocialAccountPublic[]> {
  const rows = await prisma.companySocialAccount.findMany({
    orderBy: { platform: "asc" },
  });
  return rows.map(toPublic);
}

export interface ConnectInput {
  platform: Platform;
  accountName: string;
  accountHandle?: string | null;
  accountId?: string | null;
  pageId?: string | null;
  username?: string | null;
  profileUrl?: string | null;
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: string | null;
  connectedBy: string;
  connectedById?: string | null;
  // --- TASK-45 Meta extensions (optional, provider-agnostic) ---
  instagramBusinessId?: string | null;
  pageName?: string | null;
  permissions?: string[];
  accessTokenStatus?: "ACTIVE" | "EXPIRING" | "EXPIRED" | null;
  provider?: string | null;
  // --- TASK-46 LinkedIn OAuth extensions (optional) ---
  organizationId?: string | null;
  organizationName?: string | null;
  companyName?: string | null;
  companyLogo?: string | null;
  apiVersion?: string | null;
  // -------------------------------------------------------------------
}

// Upsert by (platform, accountHandle). Tokens are encrypted at rest.
export async function connectAccount(input: ConnectInput): Promise<SocialAccountPublic> {
  const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
  const row = await prisma.companySocialAccount.upsert({
    where: {
      platform_accountHandle: {
        platform: input.platform,
        accountHandle: input.accountHandle ?? "",
      },
    },
    create: {
      platform: input.platform,
      accountName: input.accountName,
      accountHandle: input.accountHandle ?? null,
      accountId: input.accountId ?? null,
      pageId: input.pageId ?? null,
      username: input.username ?? null,
      profileUrl: input.profileUrl ?? null,
      accessToken: encrypt(input.accessToken),
      refreshToken: input.refreshToken ? encrypt(input.refreshToken) : null,
      expiresAt,
      status: "CONNECTED",
      connectedBy: input.connectedBy,
      connectedById: input.connectedById ?? null,
      instagramBusinessId: input.instagramBusinessId ?? null,
      pageName: input.pageName ?? null,
      permissions: input.permissions ?? [],
      accessTokenStatus: input.accessTokenStatus ?? "ACTIVE",
      provider: input.provider ?? "manual",
      // TASK-46 LinkedIn fields
      organizationId: input.organizationId ?? null,
      organizationName: input.organizationName ?? null,
      companyName: input.companyName ?? null,
      companyLogo: input.companyLogo ?? null,
      apiVersion: input.apiVersion ?? null,
      lastSyncAt: new Date(),
    },
    update: {
      accountName: input.accountName,
      accountId: input.accountId ?? null,
      pageId: input.pageId ?? null,
      username: input.username ?? null,
      profileUrl: input.profileUrl ?? null,
      accessToken: encrypt(input.accessToken),
      refreshToken: input.refreshToken ? encrypt(input.refreshToken) : null,
      expiresAt,
      status: "CONNECTED",
      connectedBy: input.connectedBy,
      connectedById: input.connectedById ?? null,
      instagramBusinessId: input.instagramBusinessId ?? null,
      pageName: input.pageName ?? null,
      permissions: input.permissions ?? [],
      accessTokenStatus: input.accessTokenStatus ?? "ACTIVE",
      provider: input.provider ?? "manual",
      // TASK-46 LinkedIn fields
      organizationId: input.organizationId ?? null,
      organizationName: input.organizationName ?? null,
      companyName: input.companyName ?? null,
      companyLogo: input.companyLogo ?? null,
      apiVersion: input.apiVersion ?? null,
      lastSyncAt: new Date(),
    },
  });
  return toPublic(row);
}

// Returns the decrypted access token — used only server-side by the central
// social service (Publishing / Analytics will call this, never the client).
export async function getDecryptedToken(id: string): Promise<string | null> {
  const row = await prisma.companySocialAccount.findUnique({ where: { id } });
  if (!row || !row.accessToken) return null;
  try {
    return decrypt(row.accessToken);
  } catch {
    return null;
  }
}

export async function refreshAccount(id: string): Promise<SocialAccountPublic> {
  const row = await prisma.companySocialAccount.findUnique({ where: { id } });
  if (!row) throw new Error("Account not found");

  // YouTube (Google) — real refresh via refresh token.
  if (row.provider === "youtube") {
    const refreshToken = row.refreshToken ? decrypt(row.refreshToken) : null;
    if (!refreshToken) {
      // No refresh token stored → cannot refresh; mark expiring.
      const updated = await prisma.companySocialAccount.update({
        where: { id },
        data: { lastSyncAt: new Date(), accessTokenStatus: "EXPIRING", status: "EXPIRING_SOON" },
      });
      return toPublic(updated);
    }
    const { refreshAccessToken, tokenExpiryInfo } = await import("@/services/youtube/oauth");
    const fresh = await refreshAccessToken(refreshToken);
    const { expiresAt, status } = tokenExpiryInfo(fresh.expires_in);
    const updated = await prisma.companySocialAccount.update({
      where: { id },
      data: {
        accessToken: encrypt(fresh.access_token),
        refreshToken: fresh.refresh_token ? encrypt(fresh.refresh_token) : row.refreshToken,
        expiresAt: expiresAt ?? row.expiresAt,
        accessTokenStatus: status,
        status: "CONNECTED",
        lastSyncAt: new Date(),
      },
    });
    return toPublic(updated);
  }

  // TASK-74 — Meta auto-refresh: the long-lived USER token is stored in
  // row.refreshToken. Re-exchange it for a fresh long-lived token before it
  // expires, re-encrypt, and update health fields. No new OAuth logic — it
  // reuses getLongLivedToken from services/meta/oauth.
  if (row.provider === "meta") {
    const userToken = row.refreshToken ? decrypt(row.refreshToken) : null;
    if (!userToken) {
      const updated = await prisma.companySocialAccount.update({
        where: { id },
        data: { lastSyncAt: new Date(), accessTokenStatus: "EXPIRING", status: "EXPIRING_SOON" },
      });
      return toPublic(updated);
    }
    try {
      const { getLongLivedToken, tokenExpiryInfo } = await import("@/services/meta/oauth");
      const fresh = await getLongLivedToken(userToken);
      const { expiresAt, status } = tokenExpiryInfo(fresh.expires_in);
      // Page token also rotates with the user token exchange in practice; store
      // the fresh user token as refreshToken (for next refresh) and keep the
      // existing page accessToken (page tokens are long-lived / stable).
      const updated = await prisma.companySocialAccount.update({
        where: { id },
        data: {
          refreshToken: encrypt(fresh.access_token),
          expiresAt: expiresAt ?? row.expiresAt,
          accessTokenStatus: status,
          status: "CONNECTED",
          lastSyncAt: new Date(),
        },
      });
      return toPublic(updated);
    } catch (e: any) {
      // Refresh failed (token revoked/expired) -> flag for reconnect flow.
      const updated = await prisma.companySocialAccount.update({
        where: { id },
        data: {
          accessTokenStatus: "EXPIRED",
          status: "PERMISSION_ERROR",
          lastSyncAt: new Date(),
        },
      });
      return toPublic(updated);
    }
  }

  // Fallback for providers without a dedicated refresh path (bump sync only).
  const updated = await prisma.companySocialAccount.update({
    where: { id },
    data: { lastSyncAt: new Date(), status: "CONNECTED" },
  });
  return toPublic(updated);
}

export async function disconnectAccount(id: string): Promise<void> {
  await prisma.companySocialAccount.update({
    where: { id },
    data: {
      status: "DISCONNECTED",
      isActive: false,
      accessToken: "",
      refreshToken: null,
      instagramBusinessId: null,
      accessTokenStatus: "EXPIRED",
    },
  });
}

// ---------------------------------------------------------------------------
// TASK-74 — Proactive Meta token refresh. Called before publishing/analytics
// use a Meta token: if the token is EXPIRING/EXPIRED (or within 3 days),
// refresh it in place. Returns void; failures are downgraded to PERMISSION_ERROR
// (reconnect flow) without breaking the caller.
// ---------------------------------------------------------------------------
export async function refreshMetaAccountIfNeeded(id: string): Promise<void> {
  try {
    const row = await prisma.companySocialAccount.findUnique({ where: { id } });
    if (!row || row.provider !== "meta" || row.status === "DISCONNECTED") return;
    const daysLeft = row.expiresAt
      ? (row.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      : 999;
    // Only refresh when close to expiry or already flagged.
    if (daysLeft > 3 && row.accessTokenStatus === "ACTIVE") return;
    await refreshAccount(id);
  } catch {
    /* never block the primary action on a refresh attempt */
  }
}
// Stores a Facebook Page connection plus its linked Instagram Business account.
// Tokens are encrypted at rest via lib/crypto. Reuses connectAccount's upsert.
// ---------------------------------------------------------------------------

export interface MetaConnectionInput {
  page: { id: string; name: string; accessToken: string };
  ig?: { id: string; username?: string } | null;
  userToken?: string; // long-lived user token (optional, for token refresh later)
  permissions: string[];
  expiresAt: string | null;
  connectedBy: string;
  connectedById?: string | null;
}

/**
 * Persist a Meta (Facebook Page + Instagram Business) connection.
 * - FB Page → one CompanySocialAccount (platform FACEBOOK)
 * - IG Business → one CompanySocialAccount (platform INSTAGRAM), linked via instagramBusinessId
 * Both share the same underlying page token scope so future publishing/DM works.
 */
export async function connectMetaAccount(input: MetaConnectionInput): Promise<{
  facebook: SocialAccountPublic;
  instagram: SocialAccountPublic | null;
}> {
  const fb = await connectAccount({
    platform: "FACEBOOK",
    accountName: input.page.name,
    accountHandle: input.page.id,
    accountId: input.page.id,
    pageId: input.page.id,
    pageName: input.page.name,
    accessToken: input.page.accessToken,
    refreshToken: input.userToken ?? null,
    expiresAt: input.expiresAt,
    permissions: input.permissions,
    accessTokenStatus: input.expiresAt ? "ACTIVE" : "ACTIVE",
    provider: "meta",
    connectedBy: input.connectedBy,
    connectedById: input.connectedById ?? null,
  });

  let ig: SocialAccountPublic | null = null;
  if (input.ig) {
    ig = await connectAccount({
      platform: "INSTAGRAM",
      accountName: input.ig.username
        ? `Instagram @${input.ig.username}`
        : "Instagram Business",
      accountHandle: input.ig.id,
      accountId: input.ig.id,
      pageId: input.page.id,
      instagramBusinessId: input.ig.id,
      pageName: input.page.name,
      accessToken: input.page.accessToken, // page token also grants IG business access
      refreshToken: input.userToken ?? null,
      expiresAt: input.expiresAt,
      permissions: input.permissions,
      accessTokenStatus: input.expiresAt ? "ACTIVE" : "ACTIVE",
      provider: "meta",
      connectedBy: input.connectedBy,
      connectedById: input.connectedById ?? null,
    });
  }

  return { facebook: fb, instagram: ig };
}

// ---------------------------------------------------------------------------
// TASK-46 — LinkedIn OAuth connection persistence.
// Stores a LinkedIn Organization (Company Page) connection.
// Tokens are encrypted at rest via lib/crypto. Reuses connectAccount's upsert.
// ---------------------------------------------------------------------------

export interface LinkedInConnectionInput {
  organization: {
    id: string;
    name: string;
    logoUrl?: string | null;
    vanityName?: string | null;
  };
  accessToken: string;
  refreshToken?: string | null;
  permissions?: string[];
  expiresAt: string | null;
  apiVersion: string;
  connectedBy: string;
  connectedById?: string | null;
}

/**
 * Persist a LinkedIn Organization connection.
 * Upsert key is platform=LINKEDIN + accountHandle=organizationId so reconnects
 * update the same row. Token is encrypted; nothing secret is returned to client.
 */
export async function connectLinkedInAccount(
  input: LinkedInConnectionInput,
): Promise<SocialAccountPublic> {
  return connectAccount({
    platform: "LINKEDIN",
    accountName: input.organization.name,
    accountHandle: input.organization.id,
    accountId: input.organization.id,
    username: input.organization.vanityName ?? null,
    profileUrl: input.organization.vanityName
      ? `https://www.linkedin.com/company/${input.organization.vanityName}`
      : null,
    accessToken: input.accessToken,
    refreshToken: input.refreshToken ?? null,
    expiresAt: input.expiresAt,
    permissions: input.permissions ?? [],
    accessTokenStatus: input.expiresAt ? "ACTIVE" : "ACTIVE",
    provider: "linkedin",
    connectedBy: input.connectedBy,
    connectedById: input.connectedById ?? null,
    // TASK-46 LinkedIn fields
    organizationId: input.organization.id,
    organizationName: input.organization.name,
    companyName: input.organization.name,
    companyLogo: input.organization.logoUrl ?? null,
    apiVersion: input.apiVersion,
  });
}

/**
 * Refresh a stored LinkedIn access token using its refresh token.
 * Architecture-ready: decrypt -> refresh -> re-encrypt. Returns null if no
 * refresh token is available (LinkedIn only returns one on some configs).
 */
export async function refreshLinkedInAccount(
  id: string,
): Promise<SocialAccountPublic | null> {
  const row = await prisma.companySocialAccount.findUnique({ where: { id } });
  if (!row || row.provider !== "linkedin") return null;
  const refreshToken = row.refreshToken ? decrypt(row.refreshToken) : null;
  if (!refreshToken) return null;

  // Lazy import to avoid a hard dependency cycle at module load.
  const { refreshAccessToken, tokenExpiryInfo, LINKEDIN_API_VERSION } =
    await import("@/services/linkedin/oauth");
  const fresh = await refreshAccessToken(refreshToken);
  const { expiresAt, status } = tokenExpiryInfo(fresh.expires_in);

  const updated = await prisma.companySocialAccount.update({
    where: { id },
    data: {
      accessToken: encrypt(fresh.access_token),
      refreshToken: fresh.refresh_token ? encrypt(fresh.refresh_token) : row.refreshToken,
      expiresAt: expiresAt ?? row.expiresAt,
      accessTokenStatus: status,
      status: "CONNECTED",
      lastSyncAt: new Date(),
    },
  });
  return toPublic(updated);
}

/**
 * TASK-57 — Persist a YouTube (Google) connection.
 * Reuses the shared connectAccount layer (tokens encrypted at rest).
 */
export interface YouTubeConnectionInput {
  channel: {
    id: string;
    title: string;
    handle: string | null;
    customUrl: string | null;
    thumbnail: string | null;
    subscriberCount?: string | null;
    viewCount?: string | null;
    videoCount?: string | null;
  };
  accessToken: string;
  refreshToken: string | null;
  permissions: string[];
  expiresAt: string | null;
  connectedBy: string;
  connectedById?: string | null;
}

export async function connectYouTubeAccount(
  input: YouTubeConnectionInput,
): Promise<SocialAccountPublic> {
  const handle = input.channel.handle
    ? input.channel.handle.replace(/^@/, "")
    : input.channel.customUrl
      ? input.channel.customUrl.replace(/^@/, "")
      : input.channel.id;

  return connectAccount({
    platform: "YOUTUBE",
    accountName: input.channel.title,
    accountHandle: handle,
    accountId: input.channel.id,
    username: input.channel.handle ?? null,
    profileUrl: input.channel.customUrl
      ? `https://www.youtube.com/${input.channel.customUrl}`
      : `https://www.youtube.com/channel/${input.channel.id}`,
    accessToken: input.accessToken,
    refreshToken: input.refreshToken ?? null,
    expiresAt: input.expiresAt,
    permissions: input.permissions ?? [],
    accessTokenStatus: input.expiresAt ? "ACTIVE" : "ACTIVE",
    provider: "youtube",
    connectedBy: input.connectedBy,
    connectedById: input.connectedById ?? null,
  });
}
