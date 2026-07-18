import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { listAccounts } from "@/services/social/accounts";

export const runtime = "nodejs";

/** TASK-46 — List LinkedIn-connected accounts only. */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("VIEW_SOCIAL", req);
  if (!perm.ok) {
    return NextResponse.json({ error: perm.error }, { status: perm.error === "Unauthorized" ? 401 : 403 });
  }
  const all = await listAccounts();
  const linkedin = all.filter((a) => a.provider === "linkedin" || a.platform === "LINKEDIN");
  return NextResponse.json({ accounts: linkedin });
}
