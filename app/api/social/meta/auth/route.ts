import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { buildAuthUrl, generateOAuthState, getMetaBusinessLoginEnv, getMetaOAuthPlan } from "@/services/meta/oauth";
import { logger } from "@/lib/logger";

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
    const { configurationId } = getMetaBusinessLoginEnv();
    const plan = getMetaOAuthPlan();
    const diagnosticUrl = new URL(url);
    diagnosticUrl.searchParams.set("state", "[REDACTED]");
    logger.info("auth", "Meta Business OAuth redirect prepared", {
      oauthUrl: diagnosticUrl.toString(),
      configurationId,
      requestedScopes: plan.requestedScopes,
      features: plan.features,
    });
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
    logger.error("auth", "Meta Business OAuth start failed", { message: e?.message ?? "Unknown error" });
    return NextResponse.json({ error: e.message ?? "Failed to start Meta OAuth" }, { status: 500 });
  }
}
