import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const perm = await requirePermission("MANAGE_TEAM", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });

  const duties = await prisma.duty.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ duties });
}

export async function POST(req: NextRequest) {
  const perm = await requirePermission("MANAGE_TEAM", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const department = typeof body.department === "string" ? body.department.trim() : "";
  const assignedTo = typeof body.assignedTo === "string" ? body.assignedTo.trim() : "";

  // Validate required fields
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  if (!department) return NextResponse.json({ error: "Department is required" }, { status: 400 });
  if (!assignedTo) return NextResponse.json({ error: "Assignee is required" }, { status: 400 });

  const priority = typeof body.priority === "string" ? body.priority : "MEDIUM";
  const status = typeof body.status === "string" ? body.status : "PENDING";

  try {
    const duty = await prisma.duty.create({
      data: {
        title,
        description: typeof body.description === "string" ? body.description : null,
        department,
        assignedTo,
        priority,
        status,
        startDate: typeof body.startDate === "string" && body.startDate ? body.startDate : null,
        dueDate: typeof body.dueDate === "string" && body.dueDate ? body.dueDate : null,
        attachment: typeof body.attachment === "string" && body.attachment ? body.attachment : null,
      },
    });
    return NextResponse.json({ duty }, { status: 201 });
  } catch (err) {
    console.error("Failed to create duty", err);
    return NextResponse.json({ error: "Failed to create duty" }, { status: 500 });
  }
}
