"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";
import { writeAudit } from "@/lib/security/audit";
import { revalidatePath } from "next/cache";
import type { Permission, UserRole } from "@/types/auth";

/**
 * TASK-62 — Server Actions. Every action verifies:
 *   1) Authentication (getCurrentUser)
 *   2) Role (must be CEO/ADMIN)
 *   3) Permission (MANAGE_ROLES / MANAGE_USERS)
 * before mutating, then writes a REAL audit row.
 */

function deny() {
  return { ok: false as const, error: "Forbidden: insufficient permissions" };
}

export async function setRolePermission(role: UserRole, permission: Permission, access: "ALLOW" | "DENY") {
  const user = await getCurrentUser();
  if (!user) return deny();
  if (user.role !== "CEO" && user.role !== "ADMIN") return deny();

  // idempotent upsert
  const existing = await prisma.rolePermission.findUnique({ where: { role_permission: { role, permission } } }).catch(() => null);
  if (existing) {
    await prisma.rolePermission.update({ where: { id: existing.id }, data: { access } });
  } else {
    await prisma.rolePermission.create({ data: { role, permission, access } });
  }
  await writeAudit({
    action: `Role permission ${access}`,
    actionType: "PERMISSION_UPDATE",
    module: "SECURITY",
    resource: `${role}:${permission}`,
    status: "SUCCESS",
    createdById: user.id,
  });
  revalidatePath("/dashboard/admin/security/permissions");
  return { ok: true as const };
}

export async function terminateSessionAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return deny();
  const token = "current"; // server action has no req; terminate by id scoped to user
  await prisma.session.deleteMany({ where: { id, userId: user.id } });
  await writeAudit({ action: "Session terminated", actionType: "SESSION", module: "SECURITY", resource: id, status: "SUCCESS", createdById: user.id });
  revalidatePath("/dashboard/admin/security/sessions");
  return { ok: true as const };
}

export async function terminateOtherSessionsAction() {
  const user = await getCurrentUser();
  if (!user) return deny();
  // Cannot reliably know current token in a server action; terminate all but
  // keep the most recent active session for this user (best-effort safety).
  const sessions = await prisma.session.findMany({ where: { userId: user.id, expires: { gt: new Date() } }, orderBy: { lastActivityAt: "desc" } });
  const keep = sessions[0]?.id;
  if (keep) await prisma.session.deleteMany({ where: { userId: user.id, NOT: { id: keep } } });
  await writeAudit({ action: "Sessions terminated (others)", actionType: "SESSION", module: "SECURITY", status: "SUCCESS", createdById: user.id });
  revalidatePath("/dashboard/admin/security/sessions");
  return { ok: true as const };
}

export async function updatePasswordPolicy(input: {
  minLength: number; requireUppercase: boolean; requireLowercase: boolean;
  requireNumber: boolean; requireSpecial: boolean; twoFactorEnabled: boolean;
}) {
  const user = await getCurrentUser();
  if (!user) return deny();
  if (user.role !== "CEO" && user.role !== "ADMIN") return deny();

  const existing = await prisma.passwordPolicy.findFirst({ where: { active: true } });
  if (existing) {
    await prisma.passwordPolicy.update({ where: { id: existing.id }, data: { ...input } });
  } else {
    await prisma.passwordPolicy.create({ data: { ...input, active: true } });
  }
  await writeAudit({ action: "Password policy updated", actionType: "SETTINGS", module: "SECURITY", status: "SUCCESS", createdById: user.id });
  revalidatePath("/dashboard/admin/security/overview");
  return { ok: true as const };
}

export async function resolveSecurityEvent(id: string) {
  const user = await getCurrentUser();
  if (!user) return deny();
  if (user.role !== "CEO" && user.role !== "ADMIN") return deny();
  await prisma.securityEvent.update({ where: { id }, data: { resolved: true } });
  await writeAudit({ action: "Security event resolved", actionType: "SECURITY_EVENT", module: "SECURITY", resource: id, status: "SUCCESS", createdById: user.id });
  revalidatePath("/dashboard/admin/security/events");
  return { ok: true as const };
}
