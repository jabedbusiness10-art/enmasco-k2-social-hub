// TASK-73 — Centralized RBAC type definitions.
// The full set of enterprise permissions. Add new permissions here only —
// the role matrix (services/auth/permissions.ts) and the catalog
// (lib/security/permissions.ts) derive from this union, so new permissions
// automatically flow into the matrix UI and audit surfaces.

export type UserRole =
  | "CEO"
  | "ADMIN" // Administrator
  | "MANAGER" // Manager (generic)
  | "MARKETING_MANAGER"
  | "MARKETING" // Marketing
  | "SALES" // Sales
  | "HR" // HR
  | "SUPPORT" // Support
  | "EDITOR" // Editor
  | "MARKETING_TEAM"
  | "CONTENT_CREATOR"
  | "ANALYST"
  | "VIEWER"
  | "CUSTOM"; // Custom role (permissions fully DB-driven)

export type Permission =
  // Dashboard & core
  | "VIEW_DASHBOARD"
  | "VIEW_TEAM"
  | "MANAGE_TEAM"
  | "APPROVE_WORK"
  // Users & roles
  | "VIEW_USERS"
  | "MANAGE_USERS"
  | "MANAGE_ROLES"
  // Social
  | "VIEW_SOCIAL"
  | "MANAGE_SOCIAL"
  | "SOCIAL_CONNECT"
  | "SOCIAL_DISCONNECT"
  // Media
  | "VIEW_MEDIA"
  | "MANAGE_MEDIA"
  | "MEDIA_UPLOAD"
  | "MEDIA_DELETE"
  // AI
  | "VIEW_AI"
  | "MANAGE_AI"
  // Analytics & insights
  | "VIEW_ANALYTICS"
  // Scheduler / publishing (legacy aliases kept for compatibility)
  | "VIEW_SCHEDULER"
  | "VIEW_PUBLISHING"
  // Settings & administration
  | "VIEW_SETTINGS"
  | "MANAGE_SETTINGS"
  // Security & audit
  | "VIEW_SECURITY"
  | "MANAGE_SECURITY"
  // Backup & recovery
  | "VIEW_BACKUP"
  | "MANAGE_BACKUP"
  // Notifications
  | "VIEW_NOTIFICATIONS"
  | "MANAGE_NOTIFICATIONS"
  // Super-user
  | "SYSTEM_ADMIN";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
}

export interface DummyUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
