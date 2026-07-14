import type { UserRole, Permission, DummyUser } from "@/types/auth";
import { dummyUsers } from "@/data/auth";

// Re-export so consumers (e.g. lib/auth-server) can import UserRole from here.
export type { UserRole } from "@/types/auth";


const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  CEO: ["VIEW_DASHBOARD", "VIEW_MEDIA", "VIEW_SCHEDULER", "VIEW_PUBLISHING", "VIEW_AI", "VIEW_SETTINGS", "MEDIA_UPLOAD", "MEDIA_DELETE", "VIEW_SOCIAL", "SOCIAL_CONNECT", "SOCIAL_DISCONNECT", "VIEW_ANALYTICS"],
  ADMIN: ["VIEW_DASHBOARD", "VIEW_MEDIA", "VIEW_SCHEDULER", "VIEW_PUBLISHING", "VIEW_AI", "VIEW_SETTINGS", "MEDIA_UPLOAD", "MEDIA_DELETE", "VIEW_SOCIAL", "SOCIAL_CONNECT", "SOCIAL_DISCONNECT", "VIEW_ANALYTICS"],
  MARKETING_MANAGER: ["VIEW_DASHBOARD", "VIEW_MEDIA", "VIEW_SCHEDULER", "VIEW_PUBLISHING", "VIEW_AI", "MEDIA_UPLOAD", "VIEW_SOCIAL", "VIEW_ANALYTICS"],
  MARKETING_TEAM: ["VIEW_DASHBOARD", "VIEW_MEDIA", "VIEW_SCHEDULER", "VIEW_PUBLISHING", "VIEW_AI", "VIEW_SOCIAL", "VIEW_ANALYTICS"],
  CONTENT_CREATOR: ["VIEW_DASHBOARD", "VIEW_MEDIA", "VIEW_SCHEDULER", "VIEW_AI", "VIEW_SOCIAL", "VIEW_ANALYTICS"],
  ANALYST: ["VIEW_DASHBOARD", "VIEW_MEDIA", "VIEW_AI", "VIEW_SOCIAL", "VIEW_ANALYTICS"],
  VIEWER: ["VIEW_DASHBOARD", "VIEW_MEDIA", "VIEW_SOCIAL", "VIEW_ANALYTICS"],
};

export function getUserPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  return getUserPermissions(userRole).includes(permission);
}

export function authenticate(email: string, password: string): DummyUser | null {
  return dummyUsers.find((u) => u.email === email && u.password === password) ?? null;
}

export function toSessionUser(user: DummyUser) {
  const { password, ...rest } = user;
  return rest;
}
