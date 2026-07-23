import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import {
  getContentPlan,
  updateContentPlan,
  deleteContentPlan,
  duplicateContentPlan,
  setApproval,
  contentActivity,
} from "@/services/content/planner";

export const runtime = "nodejs";

/** TASK-75 — Get / update / delete a single content plan. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const perm = await requirePermission("VIEW_SOCIAL", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const item = await getContentPlan(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const perm = await requirePermission("MANAGE_SOCIAL", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    const item = await updateContentPlan(id, body, { id: perm.user!.id, name: perm.user!.name });
    return NextResponse.json({ item });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Update failed" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const perm = await requirePermission("MANAGE_SOCIAL", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await deleteContentPlan(id, { id: perm.user!.id, name: perm.user!.name });
  return NextResponse.json({ ok: true });
}

/** Duplicate an existing content plan. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const perm = await requirePermission("MANAGE_SOCIAL", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const item = await duplicateContentPlan(id, { id: perm.user!.id, name: perm.user!.name });
    return NextResponse.json({ item }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Duplicate failed" }, { status: 400 });
  }
}

/** Approval decision (RBAC-respecting; central permission check). */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const perm = await requirePermission("APPROVE_WORK", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const decision = body?.decision === "REJECTED" ? "REJECTED" : "APPROVED";
  try {
    const item = await setApproval(id, decision, { id: perm.user!.id, name: perm.user!.name }, body?.comment);
    return NextResponse.json({ item });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Approval failed" }, { status: 400 });
  }
}
