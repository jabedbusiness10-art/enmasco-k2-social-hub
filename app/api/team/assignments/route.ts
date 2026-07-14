// ===========================================================================
// TASK-53 — app/api/team/assignments/route.ts
// List + create assignments. RBAC enforced.
// ===========================================================================

import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { listAssignments, createAssignment } from "@/lib/team";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requirePermission("VIEW_TEAM", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const list = await listAssignments({
    assignedToId: sp.get("assignedTo") ?? undefined,
    assignedById: sp.get("assignedBy") ?? undefined,
    status: (sp.get("status") as any) ?? undefined,
    priority: (sp.get("priority") as any) ?? undefined,
    departmentId: sp.get("department") ?? undefined,
    kind: (sp.get("kind") as any) ?? undefined,
    search: sp.get("search") ?? undefined,
    take: sp.get("take") ? Number(sp.get("take")) : 100,
  });
  return NextResponse.json({ assignments: list });
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission("MANAGE_TEAM", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.title || !body.assignedToId) {
    return NextResponse.json({ error: "title and assignedToId required" }, { status: 400 });
  }
  const a = await createAssignment({
    title: body.title,
    description: body.description,
    kind: body.kind,
    status: body.status,
    priority: body.priority,
    tags: body.tags,
    dueDate: body.dueDate,
    assignedToId: body.assignedToId,
    departmentId: body.departmentId,
    assignedById: auth.user.id,
  });
  return NextResponse.json({ assignment: a }, { status: 201 });
}
