import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { getSecurityOverview } from "@/lib/security/overview";
import { computeSecurityScore } from "@/lib/security/score";
import { logApiAccess } from "@/lib/security/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const perm = await requirePermission("MANAGE_USERS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const [overview, score] = await Promise.all([getSecurityOverview(), computeSecurityScore()]);
  await logApiAccess(req, 200, undefined, perm.user!.id, perm.user!.email);
  return NextResponse.json({ overview, score });
}
