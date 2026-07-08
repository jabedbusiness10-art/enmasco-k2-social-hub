export type SocialPlatform = "FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "WEBSITE" | "YOUTUBE";
export type PlatformStatus = "CONNECTED" | "DISCONNECTED" | "WARNING";
export type HealthStatus = "EXCELLENT" | "GOOD" | "WARNING" | "CRITICAL";
export type RoleKey = "CEO" | "ADMIN" | "MARKETING" | "CONTENT" | "VIEWER";

export interface CompanySocialAccount {
  id: string;
  platform: SocialPlatform;
  accountName: string;
  businessId: string;
  status: PlatformStatus;
  followers?: number;
  lastSync: string;
  connectedDate: string;
  lastUpdated: string;
  createdBy: string;
}

export interface HealthItem {
  id: string;
  label: string;
  value: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  time: string;
}

export interface SecurityItem {
  id: string;
  label: string;
  value: string;
}

export interface PermissionItem {
  role: RoleKey;
  access: string;
}

export interface PostingPermissionItem {
  label: string;
  requiresApproval: boolean;
}

export interface BrandSettings {
  companyName: string;
  website: string;
  logo?: string;
  language: string;
  timeZone: string;
  brandColor: string;
  signature: string;
}
