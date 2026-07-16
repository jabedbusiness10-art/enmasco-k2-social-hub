import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { listSessions, terminateSession, terminateOthers } from "@/lib/security/sessions";
import { writeAudit, logApiAccess } from "@/lib/security/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const perm = await requirePermission("MANAGE_USERS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const user = perm.user!;
  const sessions = await listSessions(user.id);
  await logApiAccess(req, 200, undefined, user.id, user.email);
  return NextResponse.json({ sessions });
}

export async function DELETE(req: NextRequest) {
  const perm = await requirePermission("MANAGE_USERS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const user = perm.user!;
  const sp = req.nextUrl.searchParams;
  const id = sp.get("id");
  const all = sp.get("all") === "1";
  if (all) {
    // terminate others (keep current session token)
    const token = req.cookies.get("next-auth.session-token")?.value || req.cookies.get("__Secure-next-auth.session-token")?.value || "";
    await terminateOthers(user.id, token);
    await writeAudit({ action: "Sessions terminated (others)", actionType: "SESSION", module: "SECURITY", status: "SUCCESS", createdById: user.id, req });
    return NextResponse.json({ ok: true });
  }
  if (id) {
    await terminateSession(id, user.id);
    await writeAudit({ action: "Session terminated", actionType: "SESSION", module: "SECURITY", resource: id, status: "SUCCESS", createdById: user.id, req });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "id or all required" }, { status: 400 });
}
