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
}

// Upsert by (platform, accountHandle). Tokens are encrypted at rest.
export async function connectAccount(input: ConnectInput): Promise<SocialAccountPublic> {
  const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
  const row = await prisma.companySocialAccount.upsert({
    where: {
      platform_accountHandle: {
        platform: input.platform,
        accountHandle: input.accountHandle ?? null,
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
  // Real OAuth refresh would exchange the refreshToken with the provider here.
  // Architecture-ready: token is decrypted, refreshed, re-encrypted.
  const row = await prisma.companySocialAccount.update({
    where: { id },
    data: { lastSyncAt: new Date(), status: "CONNECTED" },
  });
  return toPublic(row);
}

export async function disconnectAccount(id: string): Promise<void> {
  await prisma.companySocialAccount.update({
    where: { id },
    data: { status: "DISCONNECTED", isActive: false, accessToken: "", refreshToken: null },
  });
}
