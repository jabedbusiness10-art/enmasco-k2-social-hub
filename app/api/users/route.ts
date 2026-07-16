import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/users — list all team members (persisted in DB).
export async function GET(req: NextRequest) {
  const auth = await requirePermission("VIEW_TEAM", req);
  if (!auth.ok) return NextResponse.json({ error: auth.error ?? "Unauthorized" }, { status: 401 });
  try {
    const members = await prisma.teamMember.findMany({ orderBy: { createdAt: "asc" } });
    return NextResponse.json({
      users: members.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        department: m.department ?? "",
        role: m.role ?? "",
        status: m.status.charAt(0) + m.status.slice(1).toLowerCase(),
      })),
    });
  } catch (e) {
    console.error("[api/users] GET failed", e);
    return NextResponse.json({ error: "Failed to load team members" }, { status: 500 });
  }
}

// POST /api/users — create a new team member.
export async function POST(req: NextRequest) {
  const auth = await requirePermission("MANAGE_TEAM", req);
  if (!auth.ok) return NextResponse.json({ error: auth.error ?? "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim();
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }
    const statusRaw = String(body?.status ?? "Active").toUpperCase();
    const status = (["ACTIVE", "AWAY", "OFFLINE"].includes(statusRaw) ? statusRaw : "ACTIVE") as
      | "ACTIVE"
      | "AWAY"
      | "OFFLINE";
    const created = await prisma.teamMember.create({
      data: {
        name,
        email,
        department: body?.department ? String(body.department) : null,
        role: body?.role ? String(body.role) : null,
        status,
      },
    });
    return NextResponse.json(
      {
        id: created.id,
        name: created.name,
        email: created.email,
        department: created.department ?? "",
        role: created.role ?? "",
        status: created.status.charAt(0) + created.status.slice(1).toLowerCase(),
      },
      { status: 201 },
    );
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "A member with this email already exists" }, { status: 409 });
    }
    console.error("[api/users] POST failed", e);
    return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
  }
}
