import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { contentActivity } from "@/services/content/planner";

export const runtime = "nodejs";

/** TASK-75 — Real planning activity feed (AuditLog rows for this content). */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const perm = await requirePermission("VIEW_SOCIAL", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const activity = await contentActivity(id);
  return NextResponse.json({ activity });
}
