import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { refreshLinkedInAccount } from "@/services/social/accounts";
import { writeAudit } from "@/lib/security/audit";

export const runtime = "nodejs";

/** TASK-46 — Refresh a LinkedIn connection's access token. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const updated = await refreshLinkedInAccount(id);
    if (!updated) {
      return NextResponse.json(
        { error: { provider: "LINKEDIN", code: "REAUTHORIZATION_REQUIRED", message: "LinkedIn did not issue a refresh token for this connection", recoverable: true, recovery: "Reconnect the LinkedIn organization securely." } },
        { status: 409 },
      );
    }
    await writeAudit({ action: "LINKEDIN_TOKEN_REFRESHED", actionType: "SOCIAL_CONNECT", module: "SOCIAL", resource: "CompanySocialAccount", entityId: id, createdById: perm.user!.id, req });
    return NextResponse.json({ account: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Refresh failed" }, { status: 400 });
  }
}
