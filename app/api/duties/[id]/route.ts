import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const perm = await requirePermission("MANAGE_TEAM", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing duty id" }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.title === "string") data.title = body.title;
  if (typeof body.description === "string") data.description = body.description;
  if (typeof body.department === "string") data.department = body.department;
  if (typeof body.assignedTo === "string") data.assignedTo = body.assignedTo;
  if (typeof body.priority === "string") data.priority = body.priority;
  if (typeof body.status === "string") data.status = body.status;
  if (typeof body.startDate === "string") data.startDate = body.startDate || null;
  if (typeof body.dueDate === "string") data.dueDate = body.dueDate || null;
  if (typeof body.attachment === "string") data.attachment = body.attachment || null;

  try {
    const duty = await prisma.duty.update({ where: { id }, data });
    return NextResponse.json({ duty });
  } catch (err) {
    console.error("Failed to update duty", err);
    return NextResponse.json({ error: "Failed to update duty" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const perm = await requirePermission("MANAGE_TEAM", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing duty id" }, { status: 400 });

  try {
    await prisma.duty.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to delete duty", err);
    return NextResponse.json({ error: "Failed to delete duty" }, { status: 500 });
  }
}
