import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import {
  exchangeCodeForToken,
  getLongLivedToken,
  getPages,
  getInstagramBusiness,
  debugToken,
  tokenExpiryInfo,
} from "@/services/meta/oauth";
import { connectMetaAccount } from "@/services/social/accounts";

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
  const storedState = req.cookies.get("meta_oauth_state")?.value;

  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/dashboard/social/accounts?meta=error&reason=${encodeURIComponent(reason)}`, req.url));

  if (error) {
    // User cancelled or denied — friendly enterprise message.
    const msg = errorReason === "user_denied" ? "Authorization cancelled by user" : error;
    return fail(msg);
  }
  if (!code) return fail("Missing authorization code");
  if (!state || !storedState || state !== storedState) {
    return fail("Invalid OAuth state (possible CSRF)");
  }

  try {
    const user = perm.user!;
    // 1. code → short-lived token
    const short = await exchangeCodeForToken(code);
    // 2. short-lived → long-lived (~60 days)
    const longLived = await getLongLivedToken(short.access_token);
    const { expiresAt, status } = tokenExpiryInfo(longLived.expires_in);

    // 3. validate + capture granted scopes
    const dbg = await debugToken(longLived.access_token);
    const scopes = dbg.granted_scopes ?? dbg.scopes ?? [];

    // 4. list pages
    const pages = await getPages(longLived.access_token);
    if (!pages.length) {
      return fail("No Facebook Page found for this account");
    }
    // Pick the first page (UI could let admin choose later — architecture-ready).
    const page = pages[0];

    // 5. detect linked Instagram Business account
    const ig = await getInstagramBusiness(page.id, page.access_token);

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
    return fail(e?.message ?? "Meta connection failed");
  }
}
