import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import {
  exchangeCodeForToken,
  getLongLivedToken,
  getPages,
  getInstagramBusiness,
  debugToken,
  getMetaBusinessLoginEnv,
  getMetaOAuthPlan,
  tokenExpiryInfo,
} from "@/services/meta/oauth";
import { connectMetaAccount } from "@/services/social/accounts";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

/**
 * TASK-45 — Meta OAuth callback.
 * Validates `state` (CSRF), exchanges code for a long-lived token,
 * lists Pages, detects the linked Instagram Business account, then
 * securely persists the connection. Never returns tokens to the client.
 */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) {
    return NextResponse.redirect(new URL("/dashboard/social/accounts?meta=unauthorized", req.url));
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorReason = url.searchParams.get("error_reason");
  const errorDescription = url.searchParams.get("error_description");
  const errorCode = url.searchParams.get("error_code");
  const storedState = req.cookies.get("meta_oauth_state")?.value;

  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/dashboard/social/accounts?meta=error&reason=${encodeURIComponent(reason)}`, req.url));

  if (error) {
    logger.warn("auth", "Meta Business OAuth callback rejected", {
      error,
      errorReason,
      errorDescription,
      errorCode,
      configurationId: process.env.META_LOGIN_CONFIG_ID ?? "not-configured",
    });
    // User cancelled or denied — friendly enterprise message.
    const msg = errorReason === "user_denied" ? "Authorization cancelled by user" : errorDescription || error;
    return fail(msg);
  }
  if (!code) return fail("Missing authorization code");
  if (!state || !storedState || state !== storedState) {
    return fail("Invalid OAuth state (possible CSRF)");
  }

  try {
    const user = perm.user!;
    const plan = getMetaOAuthPlan();
    const { configurationId } = getMetaBusinessLoginEnv();
    // 1. code → short-lived token
    const short = await exchangeCodeForToken(code);
    // 2. short-lived → long-lived (~60 days)
    const longLived = await getLongLivedToken(short.access_token);
    const { expiresAt, status } = tokenExpiryInfo(longLived.expires_in);

    // 3. validate + capture granted scopes
    const dbg = await debugToken(longLived.access_token);
    const scopes = dbg.granted_scopes ?? dbg.scopes ?? [];
    const missingScopes = plan.requestedScopes.filter((scope) => !scopes.includes(scope));
    logger.info("auth", "Meta Business OAuth callback scopes", {
      configurationId,
      requestedScopes: plan.requestedScopes,
      grantedScopes: scopes,
      missingScopes,
    });

    // 4. list pages
    const pages = await getPages(longLived.access_token);
    if (!pages.length) {
      return fail("No Facebook Page found for this account");
    }
    // Pick the first page (UI could let admin choose later — architecture-ready).
    const page = pages.find((candidate) => candidate.tasks?.includes("MANAGE"));
    if (!page) {
      return fail("The Facebook user must have full control/admin access to the Page");
    }

    // 5. detect linked Instagram Business account
    const instagramEnabled = plan.features.includes("instagram_publish") || plan.features.includes("instagram_insights");
    const ig = instagramEnabled ? await getInstagramBusiness(page.id, page.access_token) : null;

    // 6. persist securely (tokens encrypted at rest)
    const result = await connectMetaAccount({
      page: { id: page.id, name: page.name, accessToken: page.access_token },
      ig: ig ? { id: ig.id, username: ig.username } : null,
      userToken: longLived.access_token,
      permissions: scopes,
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
      connectedBy: user.name ?? user.email,
      connectedById: user.id,
    });

    const res = NextResponse.redirect(
      new URL("/dashboard/social/accounts?meta=success", req.url),
    );
    // clear state cookie
    res.cookies.set("meta_oauth_state", "", { path: "/", maxAge: 0 });
    return res;
  } catch (e: any) {
    logger.error("auth", "Meta Business OAuth callback failed", {
      message: e?.message ?? "Meta connection failed",
      configurationId: process.env.META_LOGIN_CONFIG_ID ?? "not-configured",
    });
    return fail(e?.message ?? "Meta connection failed");
  }
}
