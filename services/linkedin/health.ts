import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { assessLinkedInScopes, validateOrganizationAuthorization } from "./oauth";
import { IntegrationError } from "@/services/integrations/errors";

export async function getLinkedInHealth(accountId: string) {
  const account = await prisma.companySocialAccount.findUnique({ where: { id: accountId } });
  if (!account || account.provider !== "linkedin" || account.platform !== "LINKEDIN") {
    throw new IntegrationError("LINKEDIN", "AUTH_FAILED", "LinkedIn organization connection was not found", 404, true, "Connect a LinkedIn Company Page.");
  }
  const now = Date.now();
  const expiresInSeconds = account.expiresAt ? Math.floor((account.expiresAt.getTime() - now) / 1000) : null;
  const tokenStatus = expiresInSeconds == null ? "UNKNOWN" : expiresInSeconds <= 0 ? "EXPIRED" : expiresInSeconds <= 7 * 86_400 ? "EXPIRING" : "ACTIVE";
  const scopes = assessLinkedInScopes(account.permissions ?? []);
  let organizationAuthorized = false;
  let apiAvailability: "AVAILABLE" | "NOT_AUTHORIZED" | "TEMPORARILY_UNAVAILABLE" = "TEMPORARILY_UNAVAILABLE";
  let liveError: string | null = null;
  if (account.organizationId && tokenStatus !== "EXPIRED" && account.accessToken) {
    try {
      organizationAuthorized = await validateOrganizationAuthorization(decrypt(account.accessToken), account.organizationId);
      apiAvailability = organizationAuthorized ? "AVAILABLE" : "NOT_AUTHORIZED";
    } catch (error) {
      apiAvailability = error instanceof IntegrationError && ["PERMISSION_MISSING", "ORGANIZATION_ACCESS_DENIED", "REVOKED_ACCESS", "EXPIRED_TOKEN"].includes(error.code) ? "NOT_AUTHORIZED" : "TEMPORARILY_UNAVAILABLE";
      liveError = error instanceof Error ? error.message : "LinkedIn availability check failed";
    }
  }
  const checks = [
    account.status === "CONNECTED",
    tokenStatus === "ACTIVE",
    scopes.capabilities.organizationDiscovery,
    organizationAuthorized,
    apiAvailability === "AVAILABLE",
  ];
  const healthScore = Math.round(checks.filter(Boolean).length / checks.length * 100);
  await prisma.companySocialAccount.update({ where: { id: accountId }, data: { lastValidatedAt: new Date(), permissionStatus: organizationAuthorized ? (scopes.capabilities.publishPosts ? "AUTHORIZED" : "PARTIAL") : "ORGANIZATION_ACCESS_DENIED", lastError: liveError } });
  return {
    accountId,
    connectionStatus: account.status,
    token: { status: tokenStatus, expiresAt: account.expiresAt?.toISOString() ?? null, expiresInSeconds, automaticRefreshAvailable: Boolean(account.refreshToken), reconnectionRequired: tokenStatus === "EXPIRED" || (!account.refreshToken && tokenStatus === "EXPIRING") },
    permissions: scopes,
    organization: { id: account.organizationId, name: account.organizationName, authorized: organizationAuthorized },
    lastSync: account.lastSyncAt?.toISOString() ?? null,
    lastPublish: account.lastPublishAt?.toISOString() ?? null,
    lastError: liveError ?? account.lastError,
    apiAvailability,
    healthScore,
    checkedAt: new Date().toISOString(),
  };
}
