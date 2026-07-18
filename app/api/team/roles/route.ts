import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { logApiAccess } from "@/lib/security/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// TEAM → Roles. Real team/org structure only: Department Roles (departments),
// Team Hierarchy (members grouped by department), and Assignments. Distinct
// from the User Roles module (which governs RBAC permissions).
export async function GET(req: NextRequest) {
  const perm = await requirePermission("VIEW_TEAM", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });

  const [departments, members, assignments] = await Promise.all([
    prisma.department.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { users: true, assignments: true } } },
    }),
    prisma.user.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        avatar: true,
        role: { select: { name: true } },
        department: { select: { id: true, name: true } },
        status: true,
      },
    }),
    prisma.assignment.findMany({
      where: { status: { not: "COMPLETED" } },
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        assignedTo: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    }),
  ]);

  await logApiAccess(req, 200, undefined, perm.user!.id, perm.user!.email);
  return NextResponse.json({ departments, members, assignments });
}
