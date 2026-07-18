import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { buildAuthUrl, generateOAuthState, hashOAuthState } from "@/services/linkedin/oauth";
import { asPublicIntegrationError } from "@/services/integrations/errors";

export const runtime = "nodejs";

/** TASK-46 — Start LinkedIn OAuth: generate CSRF state, set cookie, redirect. */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) {
    return NextResponse.redirect(new URL("/dashboard/social/accounts?linkedin=unauthorized", req.url));
  }
  let state: string;
  let url: string;
  try {
    state = generateOAuthState();
    url = buildAuthUrl(state);
    await prisma.linkedInOAuthSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    await prisma.linkedInOAuthSession.create({
      data: {
        stateHash: hashOAuthState(state),
        userId: perm.user!.id,
        expiresAt: new Date(Date.now() + 10 * 60_000),
      },
    });
  } catch (error) {
    const publicError = asPublicIntegrationError(error, "LINKEDIN");
    return NextResponse.json(publicError.error, { status: publicError.status });
  }
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
