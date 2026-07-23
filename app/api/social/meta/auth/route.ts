import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import {
  buildAuthUrl,
  generateOAuthState,
  getMetaBusinessLoginEnv,
  getMetaOAuthPlan,
  logSafeMetaDiagnostics,
} from "@/services/meta/oauth";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

/**
 * TASK-45 — Begin Meta OAuth.
 * Generates a CSRF `state`, stores it in an httpOnly cookie, and redirects
 * the admin to Meta's authorization screen.
 *
 * TASK-81.6E — Added env validation + safe diagnostics.
 */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) {
    return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  }

  try {
    // TASK-81.6E — Validate environment values early (trimmed, numeric, present)
    getMetaBusinessLoginEnv();

    const state = generateOAuthState();
    const url = buildAuthUrl(state);
    const { configurationId } = getMetaBusinessLoginEnv();
    const plan = getMetaOAuthPlan();

    // TASK-81.6E — Safe diagnostics (development only)
    logSafeMetaDiagnostics();

    // Safe parameter summary for production logging (no full URL, no state, no secret)
    const parsed = new URL(url);
    logger.info("auth", "Meta Business OAuth redirect prepared", {
      hostname: parsed.hostname,
      pathname: parsed.pathname,
      clientIdLast4: parsed.searchParams.get("client_id")?.slice(-4) ?? "n/a",
      configIdLast4: parsed.searchParams.get("config_id")?.slice(-4) ?? "n/a",
      redirectUri: parsed.searchParams.get("redirect_uri"),
      responseType: parsed.searchParams.get("response_type"),
      statePresent: parsed.searchParams.has("state"),
      configurationId: configurationId.length >= 4 ? `...${configurationId.slice(-4)}` : "n/a",
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
    logger.error("auth", "Meta Business OAuth start failed", {
      message: e?.message ?? "Unknown error",
    });
    // TASK-81.6E — Return structured server error with descriptive message
    return NextResponse.json(
      {
        error: "Meta OAuth configuration error",
        detail: e?.message ?? "Failed to start Meta OAuth",
      },
      { status: 500 },
    );
  }
}
