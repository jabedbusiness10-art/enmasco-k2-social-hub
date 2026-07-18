import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { assessLinkedInScopes, validateOrganizationAuthorization } from "./oauth";
import { IntegrationError } from "@/services/integrations/errors";

export type LinkedInCapability = "organizationDiscovery" | "readPosts" | "publishPosts" | "analytics";

export async function requireLinkedInAccount(accountId: string, capability: LinkedInCapability, validateOrganization = false) {
  const account = await prisma.companySocialAccount.findUnique({ where: { id: accountId } });
  if (!account || account.provider !== "linkedin" || account.platform !== "LINKEDIN") {
    throw new IntegrationError("LINKEDIN", "AUTH_FAILED", "LinkedIn organization connection was not found", 404, true, "Connect a LinkedIn Company Page.");
  }
  if (!account.organizationId) {
    throw new IntegrationError("LINKEDIN", "ORGANIZATION_ACCESS_DENIED", "The connection is not linked to a company organization", 409, true, "Reconnect and select an approved LinkedIn Company Page.");
  }
  if (account.expiresAt && account.expiresAt <= new Date()) {
    await prisma.companySocialAccount.update({ where: { id: accountId }, data: { status: "PERMISSION_ERROR", accessTokenStatus: "EXPIRED", permissionStatus: "REAUTHORIZATION_REQUIRED", lastValidatedAt: new Date(), lastError: "LinkedIn token expired" } });
    throw new IntegrationError("LINKEDIN", "EXPIRED_TOKEN", "LinkedIn access token expired", 401, true, "Reconnect the LinkedIn organization.");
  }
  if (account.status === "DISCONNECTED" || account.status === "PERMISSION_ERROR") {
    throw new IntegrationError("LINKEDIN", "REVOKED_ACCESS", "LinkedIn connection requires authorization", 401, true, "Reconnect the LinkedIn organization.");
  }
  const scopes = assessLinkedInScopes(account.permissions ?? []);
  if (!scopes.capabilities[capability]) {
    await prisma.companySocialAccount.update({ where: { id: accountId }, data: { permissionStatus: "MISSING_SCOPE", lastValidatedAt: new Date(), lastError: `Missing LinkedIn capability: ${capability}` } });
    throw new IntegrationError("LINKEDIN", "PERMISSION_MISSING", `LinkedIn permission is missing for ${capability}`, 403, true, "Approve the required LinkedIn product and reconnect.");
  }
  let accessToken: string;
  try {
    accessToken = decrypt(account.accessToken);
  } catch {
    throw new IntegrationError("LINKEDIN", "AUTH_FAILED", "Stored LinkedIn credential cannot be decrypted", 500, true, "Reconnect the LinkedIn organization.");
  }
  if (!accessToken) {
    throw new IntegrationError("LINKEDIN", "AUTH_FAILED", "Stored LinkedIn credential is missing", 401, true, "Reconnect the LinkedIn organization.");
  }
  if (validateOrganization) {
    const authorized = await validateOrganizationAuthorization(accessToken, account.organizationId);
    if (!authorized) {
      await prisma.companySocialAccount.update({ where: { id: accountId }, data: { status: "PERMISSION_ERROR", permissionStatus: "ORGANIZATION_ACCESS_DENIED", lastValidatedAt: new Date(), lastError: "LinkedIn organization authorization was revoked" } });
      throw new IntegrationError("LINKEDIN", "ORGANIZATION_ACCESS_DENIED", "The member no longer manages this LinkedIn organization", 403, true, "Reconnect with an approved organization administrator.");
    }
  }
  await prisma.companySocialAccount.update({ where: { id: accountId }, data: { lastValidatedAt: new Date(), permissionStatus: "AUTHORIZED", lastError: null } });
  return { account, accessToken, scopes };
}

export async function markLinkedInOperationError(accountId: string, error: unknown) {
  const message = error instanceof Error ? error.message.slice(0, 280) : "LinkedIn operation failed";
  const code = error instanceof IntegrationError ? error.code : "API_ERROR";
  await prisma.companySocialAccount.update({
    where: { id: accountId },
    data: {
      lastError: message,
      lastValidatedAt: new Date(),
      ...(code === "EXPIRED_TOKEN" || code === "REVOKED_ACCESS" ? { status: "PERMISSION_ERROR" as const, accessTokenStatus: "EXPIRED" } : {}),
      ...(code === "PERMISSION_MISSING" || code === "ORGANIZATION_ACCESS_DENIED" ? { permissionStatus: code } : {}),
    },
  }).catch(() => undefined);
}
