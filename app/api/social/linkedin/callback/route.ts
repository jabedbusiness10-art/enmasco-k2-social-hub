import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import {
  assessLinkedInScopes,
  exchangeCodeForToken,
  getOrganizations,
  hashOAuthState,
  safeStateEqual,
  tokenExpiryInfo,
} from "@/services/linkedin/oauth";
import { IntegrationError } from "@/services/integrations/errors";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  const destination = new URL("/dashboard/social/accounts", req.url);
  const fail = (code: string) => {
    destination.searchParams.set("linkedin", "error");
    destination.searchParams.set("code", code);
    const response = NextResponse.redirect(destination);
    response.cookies.set("linkedin_oauth_state", "", { path: "/", maxAge: 0 });
    return response;
  };
  if (!perm.ok) return fail("UNAUTHORIZED");

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const storedState = req.cookies.get("linkedin_oauth_state")?.value;
  if (req.nextUrl.searchParams.get("error")) return fail("OAUTH_DENIED");
  if (!code) return fail("MISSING_CODE");
  if (!state || !storedState || !safeStateEqual(state, storedState)) return fail("INVALID_STATE");

  const session = await prisma.linkedInOAuthSession.findUnique({ where: { stateHash: hashOAuthState(state) } });
  if (!session || session.userId !== perm.user!.id || session.expiresAt <= new Date() || session.consumedAt) {
    return fail("EXPIRED_STATE");
  }

  try {
    const token = await exchangeCodeForToken(code);
    const permissions = (token.scope ?? "").split(/[\s,]+/).filter(Boolean);
    const scopeAssessment = assessLinkedInScopes(permissions);
    if (!scopeAssessment.capabilities.organizationDiscovery) {
      throw new IntegrationError("LINKEDIN", "PERMISSION_MISSING", "LinkedIn organization administration scope was not granted", 403, true, "Approve an organization administration product and reconnect.");
    }
    const organizations = await getOrganizations(token.access_token);
    if (!organizations.length) {
      throw new IntegrationError("LINKEDIN", "ORGANIZATION_ACCESS_DENIED", "No manageable LinkedIn Company Page was found", 403, true, "Use a LinkedIn member with an approved company-page role.");
    }
    const { expiresAt } = tokenExpiryInfo(token.expires_in);
    await prisma.linkedInOAuthSession.update({
      where: { id: session.id },
      data: {
        accessTokenEncrypted: encrypt(token.access_token),
        refreshTokenEncrypted: token.refresh_token ? encrypt(token.refresh_token) : null,
        tokenExpiresAt: expiresAt,
        permissions,
        organizations: organizations as any,
      },
    });

    destination.searchParams.set("linkedin", "select");
    destination.searchParams.set("session", session.id);
    const response = NextResponse.redirect(destination);
    response.cookies.set("linkedin_oauth_state", "", { path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    return fail(error instanceof IntegrationError ? error.code : "OAUTH_CALLBACK_FAILED");
  }
}
