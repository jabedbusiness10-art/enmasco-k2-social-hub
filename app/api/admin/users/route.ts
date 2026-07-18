import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TASK-72 — Employee Directory data source.
 * Returns REAL Prisma User records (not the legacy teamMember table) with
 * resolved role + department + status. Powers the dashboard Employee
 * Directory widget. No hardcoded values.
 */
export async function GET(req: NextRequest) {
  const auth = await requirePermission("VIEW_TEAM", req);
  if (!auth.ok) return NextResponse.json({ error: auth.error ?? "Unauthorized" }, { status: 401 });
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        status: true,
        role: { select: { name: true } },
        department: { select: { name: true } },
      },
    });
    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar ?? null,
        department: u.department?.name ?? "Unassigned",
        role: u.role?.name ?? "Member",
        status: u.status,
      })),
      count: users.length,
    });
  } catch (e) {
    console.error("[api/admin/users] GET failed", e);
    return NextResponse.json({ error: "Failed to load users", detail: e instanceof Error ? e.message : "unknown" }, { status: 500 });
  }
}
