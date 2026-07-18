import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { disconnectAccount } from "@/services/social/accounts";
import { writeAudit } from "@/lib/security/audit";

export const runtime = "nodejs";

/** TASK-46 — Disconnect a LinkedIn connection (clears tokens + LinkedIn fields). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const perm = await requirePermission("SOCIAL_DISCONNECT", req);
  if (!perm.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await disconnectAccount(id);
    await writeAudit({ action: "LINKEDIN_DISCONNECTED", actionType: "SOCIAL_DISCONNECT", module: "SOCIAL", resource: "CompanySocialAccount", entityId: id, createdById: perm.user!.id, req });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Disconnect failed" }, { status: 400 });
  }
}
