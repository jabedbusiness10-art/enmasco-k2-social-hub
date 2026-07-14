// ===========================================================================
// TASK-53 — app/api/team/assignments/[id]/route.ts
// Update assignment (status, priority, assignee, etc.) + history.
// ===========================================================================

import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { getAssignment, updateAssignment } from "@/lib/team";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission("VIEW_TEAM", _req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const { id } = await params;
  const a = await getAssignment(id);
  if (!a) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ assignment: a });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission("MANAGE_TEAM", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const updated = await updateAssignment(id, auth.user.id, body);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ assignment: updated });
}
