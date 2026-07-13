import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { buildAuthUrl, generateOAuthState } from "@/services/linkedin/oauth";

export const runtime = "nodejs";

/** TASK-46 — Start LinkedIn OAuth: generate CSRF state, set cookie, redirect. */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) {
    return NextResponse.redirect(new URL("/dashboard/social/accounts?linkedin=unauthorized", req.url));
  }
  const state = generateOAuthState();
  const url = buildAuthUrl(state);
  const res = NextResponse.redirect(url);
  // httpOnly + sameSite so the state can't be read by JS / CSRF-replayed.
  res.cookies.set("linkedin_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  return res;
}
