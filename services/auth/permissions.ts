import type { UserRole, Permission, DummyUser } from "@/types/auth";
import { dummyUsers } from "@/data/auth";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  CEO: ["VIEW_DASHBOARD", "VIEW_MEDIA", "VIEW_SCHEDULER", "VIEW_PUBLISHING", "VIEW_AI", "VIEW_SETTINGS", "MEDIA_UPLOAD", "MEDIA_DELETE", "VIEW_SOCIAL", "SOCIAL_CONNECT", "SOCIAL_DISCONNECT"],
  ADMIN: ["VIEW_DASHBOARD", "VIEW_MEDIA", "VIEW_SCHEDULER", "VIEW_PUBLISHING", "VIEW_AI", "VIEW_SETTINGS", "MEDIA_UPLOAD", "MEDIA_DELETE", "VIEW_SOCIAL", "SOCIAL_CONNECT", "SOCIAL_DISCONNECT"],
  MARKETING_MANAGER: ["VIEW_DASHBOARD", "VIEW_MEDIA", "VIEW_SCHEDULER", "VIEW_PUBLISHING", "VIEW_AI", "MEDIA_UPLOAD", "VIEW_SOCIAL"],
  MARKETING_TEAM: ["VIEW_DASHBOARD", "VIEW_MEDIA", "VIEW_SCHEDULER", "VIEW_PUBLISHING", "VIEW_AI", "VIEW_SOCIAL"],
  CONTENT_CREATOR: ["VIEW_DASHBOARD", "VIEW_MEDIA", "VIEW_SCHEDULER", "VIEW_AI", "VIEW_SOCIAL"],
  ANALYST: ["VIEW_DASHBOARD", "VIEW_MEDIA", "VIEW_AI", "VIEW_SOCIAL"],
  VIEWER: ["VIEW_DASHBOARD", "VIEW_MEDIA", "VIEW_SOCIAL"],
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
