import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { logApiAccess } from "@/lib/security/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// TEAM → Activity dashboard. Real team operations only:
// Team Events (assignment activity), Department Changes (assignment history),
// Assignment History, and a Team Timeline. No user/security data mixed in.
export async function GET(req: NextRequest) {
  const perm = await requirePermission("VIEW_TEAM", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });

  const [events, changes, assignments, departments] = await Promise.all([
    prisma.assignmentActivity.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        actor: { select: { id: true, name: true, avatar: true } },
        assignment: { select: { id: true, title: true } },
      },
    }),
    prisma.assignmentHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { assignment: { select: { id: true, title: true } } },
    }),
    prisma.assignment.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        assignedBy: { select: { id: true, name: true, avatar: true } },
        assignedTo: { select: { id: true, name: true, avatar: true } },
        department: { select: { id: true, name: true } },
      },
    }),
    prisma.department.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { users: true, assignments: true } } } }),
  ]);

  await logApiAccess(req, 200, undefined, perm.user!.id, perm.user!.email);
  return NextResponse.json({ events, changes, assignments, departments });
}
