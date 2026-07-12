import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { buildAuthUrl, generateOAuthState } from "@/services/meta/oauth";

export const runtime = "nodejs";

/**
 * TASK-45 — Begin Meta OAuth.
 * Generates a CSRF `state`, stores it in an httpOnly cookie, and redirects
 * the admin to Meta's authorization screen.
 */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) {
    return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  }

  try {
    const state = generateOAuthState();
    const url = buildAuthUrl(state);
    const res = NextResponse.redirect(url);
    // httpOnly + sameSite=lax protects against CSRF; short TTL.
    res.cookies.set("meta_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed to start Meta OAuth" }, { status: 500 });
  }
}
