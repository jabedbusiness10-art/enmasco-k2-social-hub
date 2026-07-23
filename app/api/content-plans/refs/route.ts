import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { listReferenceData } from "@/services/content/planner";

export const runtime = "nodejs";

/** TASK-75 — Real reference data for the Company Content Planner (campaigns, users, departments). */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("VIEW_SOCIAL", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const data = await listReferenceData();
  return NextResponse.json(data);
}
