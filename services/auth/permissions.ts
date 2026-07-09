import type { UserRole, Permission, DummyUser } from "@/types/auth";
import { dummyUsers } from "@/data/auth";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  CEO: ["VIEW_DASHBOARD", "VIEW_MEDIA", "VIEW_SCHEDULER", "VIEW_PUBLISHING", "VIEW_AI", "VIEW_SETTINGS"],
  ADMIN: ["VIEW_DASHBOARD", "VIEW_MEDIA", "VIEW_SCHEDULER", "VIEW_PUBLISHING", "VIEW_AI", "VIEW_SETTINGS"],
  MARKETING_MANAGER: ["VIEW_DASHBOARD", "VIEW_MEDIA", "VIEW_SCHEDULER", "VIEW_PUBLISHING", "VIEW_AI"],
  MARKETING_TEAM: ["VIEW_DASHBOARD", "VIEW_MEDIA", "VIEW_SCHEDULER", "VIEW_PUBLISHING", "VIEW_AI"],
  CONTENT_CREATOR: ["VIEW_DASHBOARD", "VIEW_MEDIA", "VIEW_SCHEDULER", "VIEW_AI"],
  ANALYST: ["VIEW_DASHBOARD", "VIEW_MEDIA", "VIEW_AI"],
  VIEWER: ["VIEW_DASHBOARD", "VIEW_MEDIA"],
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
