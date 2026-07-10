export type UserRole = "CEO" | "ADMIN" | "MARKETING_MANAGER" | "MARKETING_TEAM" | "CONTENT_CREATOR" | "ANALYST" | "VIEWER";

export type Permission = "VIEW_DASHBOARD" | "VIEW_MEDIA" | "VIEW_SCHEDULER" | "VIEW_PUBLISHING" | "VIEW_AI" | "VIEW_SETTINGS" | "MEDIA_UPLOAD" | "MEDIA_DELETE" | "VIEW_SOCIAL" | "SOCIAL_CONNECT" | "SOCIAL_DISCONNECT";

export type UserRole = "CEO" | "ADMIN" | "MARKETING_MANAGER" | "MARKETING_TEAM" | "CONTENT_CREATOR" | "ANALYST" | "VIEWER";

export interface SessionUser {
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
