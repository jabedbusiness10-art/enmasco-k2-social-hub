/**
 * TASK-62 — Permission service.
 * Merges the STATIC ROLE_PERMISSIONS map (services/auth/permissions.ts)
 * with DB-driven role/permission grants + per-user overrides.
 * Static map stays the source of truth for default behavior; DB rows
 * layer ALLOW/DENY on top (DB DENY wins, DB ALLOW adds).
 */
import { prisma } from "@/lib/db";
import { getUserPermissions as staticPerms } from "@/services/auth/permissions";
import type { Permission, UserRole } from "@/types/auth";

const ALL_PERMS = [
  "VIEW_DASHBOARD", "VIEW_TEAM", "MANAGE_TEAM", "APPROVE_WORK",
  "VIEW_USERS", "MANAGE_USERS", "MANAGE_ROLES",
  "VIEW_SOCIAL", "MANAGE_SOCIAL", "SOCIAL_CONNECT", "SOCIAL_DISCONNECT",
  "VIEW_MEDIA", "MANAGE_MEDIA", "MEDIA_UPLOAD", "MEDIA_DELETE",
  "VIEW_AI", "MANAGE_AI",
  "VIEW_ANALYTICS",
  "VIEW_SCHEDULER", "VIEW_PUBLISHING",
  "VIEW_SETTINGS", "MANAGE_SETTINGS",
  "VIEW_SECURITY", "MANAGE_SECURITY",
  "VIEW_BACKUP", "MANAGE_BACKUP",
  "VIEW_NOTIFICATIONS", "MANAGE_NOTIFICATIONS",
  "SYSTEM_ADMIN",
] as Permission[];

/** Effective permission set for a role (static + DB role grants). */
export async function getRolePermissions(role: UserRole): Promise<Permission[]> {
  const base = new Set<Permission>(staticPerms(role));
  const rows = await prisma.rolePermission.findMany({ where: { role } }).catch(() => []);
  for (const r of rows) {
    if (r.access === "ALLOW") base.add(r.permission as Permission);
    else base.delete(r.permission as Permission);
  }
  return [...base];
}

/** Per-user effective permissions (role + DB role grants + user overrides). */
export async function getUserEffectivePermissions(userId: string, primaryRole: UserRole): Promise<Permission[]> {
  const rolePerms = await getRolePermissions(primaryRole);
  const base = new Set<Permission>(rolePerms);
  const overrides = await prisma.userPermissionOverride
    .findMany({ where: { userId } })
    .catch(() => []);
  for (const o of overrides) {
    if (o.access === "ALLOW") base.add(o.permission as Permission);
    else base.delete(o.permission as Permission);
  }
  return [...base];
}

export async function hasPermissionDb(userId: string, primaryRole: UserRole, permission: Permission): Promise<boolean> {
  const eff = await getUserEffectivePermissions(userId, primaryRole);
  return eff.includes(permission);
}

/** All roles with their effective permissions (for the matrix UI). */
export async function getRoleMatrix(): Promise<{ role: UserRole; permissions: Permission[] }[]> {
  const roles = (await prisma.role.findMany().catch(() => [])) as { name: UserRole }[];
  const out = await Promise.all(
    roles.map(async (r) => ({ role: r.name, permissions: await getRolePermissions(r.name) }))
  );
  return out;
}

export const PERMISSION_CATALOG: { name: Permission; category: string }[] = ALL_PERMS.map((p) => ({
  name: p,
  category: p.split("_")[0] === "MANAGE" ? "ADMIN" : p.split("_")[0],
}));
