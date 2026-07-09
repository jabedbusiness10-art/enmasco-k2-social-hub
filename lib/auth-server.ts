import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission, type UserRole } from "@/services/auth/permissions";
import type { Permission } from "@/types/auth";

export async function getCurrentUser(req?: NextRequest) {
  // In App Router route handlers, getServerSession must receive the request
  // so it can read the JWT cookie and run the session callback (which injects
  // `role`). Without `req` it returns a session lacking custom fields.
  const session = req
    ? await getServerSession(req, {} as any, auth)
    : await getServerSession(auth);
  if (!session?.user) return null;
  return session.user as {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    department?: string;
    avatar?: string;
  };
}

export async function requirePermission(
  permission: Permission,
  req?: NextRequest,
): Promise<{
  ok: boolean;
  user?: Awaited<ReturnType<typeof getCurrentUser>>;
  error?: string;
}> {
  const user = await getCurrentUser(req);
  if (!user) return { ok: false, error: "Unauthorized" };
  if (!hasPermission(user.role, permission)) {
    return { ok: false, error: "Forbidden: insufficient permissions" };
  }
  return { ok: true, user };
}
