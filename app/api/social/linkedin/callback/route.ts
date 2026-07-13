import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import {
  exchangeCodeForToken,
  getOrganizations,
  getOrganization,
  tokenExpiryInfo,
  LINKEDIN_API_VERSION,
} from "@/services/linkedin/oauth";
import { connectLinkedInAccount } from "@/services/social/accounts";

export const runtime = "nodejs";

/**
 * TASK-46 — LinkedIn OAuth callback.
 * Validates `state` (CSRF), exchanges code for a token, lists the member's
 * organizations, selects the first, fetches its details, then securely
 * persists the connection. Never returns tokens to the client.
 */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) {
    return NextResponse.redirect(new URL("/dashboard/social/accounts?linkedin=unauthorized", req.url));
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDesc = url.searchParams.get("error_description");
  const storedState = req.cookies.get("linkedin_oauth_state")?.value;

  const fail = (reason: string) =>
    NextResponse.redirect(
      new URL(`/dashboard/social/accounts?linkedin=error&reason=${encodeURIComponent(reason)}`, req.url),
    );

  if (error) {
    const msg = errorDesc ?? error;
    return fail(msg);
  }
  if (!code) return fail("Missing authorization code");
  if (!state || !storedState || state !== storedState) {
    return fail("Invalid OAuth state (possible CSRF)");
  }

  try {
    const user = perm.user!;
    // 1. code -> access token (+ optional refresh token)
    const token = await exchangeCodeForToken(code);
    const { expiresAt, status } = tokenExpiryInfo(token.expires_in);

    // 2. list organizations the member can manage
    const orgs = await getOrganizations(token.access_token);
    if (!orgs.length) {
      return fail("No LinkedIn Company Page found for this account");
    }
    // Pick the first organization (UI could let admin choose later).
    const first = orgs[0];
    const org = await getOrganization(token.access_token, first.id);

    // 3. persist securely (tokens encrypted at rest)
    await connectLinkedInAccount({
      organization: {
        id: org.id,
        name: org.name,
        logoUrl: org.logoUrl ?? null,
        vanityName: org.vanityName ?? null,
      },
      accessToken: token.access_token,
      refreshToken: token.refresh_token ?? null,
      permissions: token.scope ? token.scope.split(" ") : [],
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
      apiVersion: LINKEDIN_API_VERSION,
      connectedBy: user.name ?? user.email,
      connectedById: user.id,
    });

    const res = NextResponse.redirect(new URL("/dashboard/social/accounts?linkedin=success", req.url));
    res.cookies.set("linkedin_oauth_state", "", { path: "/", maxAge: 0 });
    return res;
  } catch (e: any) {
    return fail(e?.message ?? "LinkedIn connection failed");
  }
}
