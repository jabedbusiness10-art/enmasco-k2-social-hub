import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { getRoleMatrix, getUserEffectivePermissions } from "@/lib/security/permissions";
import { logApiAccess } from "@/lib/security/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// USERS → Roles. Real RBAC only: the permission matrix, every user with their
// effective permissions (role + DB overrides), and the department list used for
// access levels. Distinct from TEAM → Roles (org structure).
export async function GET(req: NextRequest) {
  const perm = await requirePermission("MANAGE_ROLES", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });

  const [matrix, users, departments] = await Promise.all([
    getRoleMatrix(),
    prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, avatar: true, role: { select: { name: true } }, department: { select: { id: true, name: true } }, status: true },
    }),
    prisma.department.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const usersWithPerms = await Promise.all(
    users.map(async (u) => ({ ...u, effectivePermissions: await getUserEffectivePermissions(u.id, u.role.name) })),
  );

  await logApiAccess(req, 200, undefined, perm.user!.id, perm.user!.email);
  return NextResponse.json({ matrix, users: usersWithPerms, departments });
}
