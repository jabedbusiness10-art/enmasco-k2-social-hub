import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { hasPermission, type UserRole } from "@/services/auth/permissions";
import type { Permission } from "@/types/auth";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
}

// getServerSession(auth) in this next-auth@4 App Router setup fails to apply
// the `session` callback, so custom JWT fields (role, department) are dropped
// and permission checks fail with 401. Reading the JWT token directly via
// getToken surfaces `role` reliably, so we map the token to a SessionUser here.
export async function getCurrentUser(req?: NextRequest): Promise<SessionUser | null> {
  if (!req) return null;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.email) return null;
  return {
    id: (token.id as string) ?? (token.sub as string) ?? "",
    name: (token.name as string) ?? "",
    email: token.email as string,
    role: token.role as UserRole,
    department: token.department as string | undefined,
    avatar: token.picture as string | undefined,
  };
}

export async function requirePermission(
  permission: Permission,
  req?: NextRequest,
): Promise<{
  ok: boolean;
  user?: SessionUser;
  error?: string;
}> {
  const user = await getCurrentUser(req);
  if (!user) return { ok: false, error: "Unauthorized" };
  if (!hasPermission(user.role, permission)) {
    return { ok: false, error: "Forbidden: insufficient permissions" };
  }
  return { ok: true, user };
}
