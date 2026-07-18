import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { connectLinkedInAccount } from "@/services/social/accounts";
import { assessLinkedInScopes, type LinkedInOrganization } from "@/services/linkedin/oauth";
import { LINKEDIN_API_VERSION } from "@/services/linkedin/client";
import { writeAudit } from "@/lib/security/audit";

export const runtime = "nodejs";

async function loadSession(req: NextRequest, userId: string, id: string | null) {
  if (!id) return null;
  const session = await prisma.linkedInOAuthSession.findUnique({ where: { id } });
  if (!session || session.userId !== userId || session.expiresAt <= new Date() || session.consumedAt || !session.accessTokenEncrypted) return null;
  return session;
}

export async function GET(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: perm.error === "Unauthorized" ? 401 : 403 });
  const session = await loadSession(req, perm.user!.id, req.nextUrl.searchParams.get("session"));
  if (!session) return NextResponse.json({ error: "Organization selection session expired" }, { status: 410 });
  return NextResponse.json({
    organizations: (session.organizations as unknown as LinkedInOrganization[]) ?? [],
    scopes: assessLinkedInScopes(session.permissions),
    expiresAt: session.expiresAt.toISOString(),
  });
}

export async function POST(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: perm.error === "Unauthorized" ? 401 : 403 });
  const body = await req.json().catch(() => null) as { sessionId?: string; organizationId?: string } | null;
  const session = await loadSession(req, perm.user!.id, body?.sessionId ?? null);
  if (!session) return NextResponse.json({ error: "Organization selection session expired" }, { status: 410 });
  const organizations = (session.organizations as unknown as LinkedInOrganization[]) ?? [];
  const organization = organizations.find((item) => item.id === body?.organizationId && item.adminState === "APPROVED");
  if (!organization) return NextResponse.json({ error: "Organization is not authorized for this OAuth session" }, { status: 403 });

  const scopeAssessment = assessLinkedInScopes(session.permissions);
  const account = await connectLinkedInAccount({
    organization,
    accessToken: decrypt(session.accessTokenEncrypted!),
    refreshToken: session.refreshTokenEncrypted ? decrypt(session.refreshTokenEncrypted) : null,
    permissions: session.permissions,
    expiresAt: session.tokenExpiresAt?.toISOString() ?? null,
    apiVersion: LINKEDIN_API_VERSION,
    connectedBy: perm.user!.name || perm.user!.email,
    connectedById: perm.user!.id,
    permissionStatus: scopeAssessment.capabilities.publishPosts ? "AUTHORIZED" : "PARTIAL",
    providerCapabilities: scopeAssessment.capabilities,
    connectionMetadata: {
      websiteUrl: organization.websiteUrl ?? null,
      industries: organization.industries ?? [],
      adminRole: organization.adminRole,
      adminState: organization.adminState,
      followerCount: organization.followerCount ?? null,
    },
  });
  await prisma.linkedInOAuthSession.update({ where: { id: session.id }, data: { consumedAt: new Date(), accessTokenEncrypted: null, refreshTokenEncrypted: null } });
  await writeAudit({ action: "LINKEDIN_ORGANIZATION_CONNECTED", actionType: "SOCIAL_CONNECT", module: "SOCIAL", resource: "CompanySocialAccount", entityName: organization.name, entityId: account.id, createdById: perm.user!.id, req, metadata: { organizationId: organization.id, permissions: session.permissions } });
  return NextResponse.json({ account }, { status: 201 });
}
