import type { NextRequest } from "next/server";
import type { Permission } from "@/types/auth";
import { getCurrentUser, type SessionUser } from "@/lib/auth-server";
import { hasPermissionDb } from "@/lib/security/permissions";

export async function requireInboxPermission(permission: Permission, req: NextRequest): Promise<
  { ok: true; user: SessionUser } | { ok: false; status: 401 | 403; error: string }
> {
  const user = await getCurrentUser(req);
  if (!user) return { ok: false, status: 401, error: "Unauthorized" };
  const allowed = await hasPermissionDb(user.id, user.role, permission);
  if (!allowed) return { ok: false, status: 403, error: "Forbidden: insufficient inbox permission" };
  return { ok: true, user };
}

export async function canViewAllInbox(user: SessionUser): Promise<boolean> {
  return hasPermissionDb(user.id, user.role, "VIEW_ALL_CONVERSATIONS");
}
