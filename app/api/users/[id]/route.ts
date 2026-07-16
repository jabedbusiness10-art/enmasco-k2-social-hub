import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = ["ACTIVE", "AWAY", "OFFLINE"] as const;
type MemberStatus = (typeof STATUSES)[number];

function serialize(m: {
  id: string;
  name: string;
  email: string;
  department: string | null;
  role: string | null;
  status: string;
}) {
  return {
    id: m.id,
    name: m.name,
    email: m.email,
    department: m.department ?? "",
    role: m.role ?? "",
    status: m.status.charAt(0) + m.status.slice(1).toLowerCase(),
  };
}

// PATCH /api/users/:id — update an existing team member.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission("MANAGE_TEAM", req);
  if (!auth.ok) return NextResponse.json({ error: auth.error ?? "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const exists = await prisma.teamMember.findUnique({ where: { id } });
    if (!exists) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (typeof body?.name === "string") data.name = body.name.trim();
    if (typeof body?.email === "string") data.email = body.email.trim();
    if (body?.department !== undefined) data.department = body.department ? String(body.department) : null;
    if (body?.role !== undefined) data.role = body.role ? String(body.role) : null;
    if (typeof body?.status === "string") {
      const s = body.status.toUpperCase();
      data.status = (STATUSES.includes(s as MemberStatus) ? s : "ACTIVE") as MemberStatus;
    }

    const updated = await prisma.teamMember.update({ where: { id }, data });
    return NextResponse.json(serialize(updated));
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "A member with this email already exists" }, { status: 409 });
    }
    if (e?.code === "P2025") return NextResponse.json({ error: "Member not found" }, { status: 404 });
    console.error("[api/users/:id] PATCH failed", e);
    return NextResponse.json({ error: "Failed to update team member" }, { status: 500 });
  }
}

// DELETE /api/users/:id — remove a team member.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission("MANAGE_TEAM", req);
  if (!auth.ok) return NextResponse.json({ error: auth.error ?? "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.teamMember.delete({ where: { id } });
    return NextResponse.json({ ok: true, id });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ ok: true, id });
    console.error("[api/users/:id] DELETE failed", e);
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
  }
}
