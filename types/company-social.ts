export type SocialPlatform = "FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "YOUTUBE" | "X" | "WEBSITE";
export type PlatformStatus = "CONNECTED" | "EXPIRING_SOON" | "DISCONNECTED" | "PERMISSION_ERROR";

export interface CompanySocialAccount {
  id: string;
  businessId: string | null;
  platform: SocialPlatform;
  accountName: string;
  accountHandle: string | null;
  accountId: string | null;
  pageId: string | null;
  username: string | null;
  profileUrl: string | null;
  status: PlatformStatus;
  connectedBy: string;
  lastSyncAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  // TASK-46 LinkedIn OAuth display fields (no tokens, server-provided).
  organizationId?: string | null;
  organizationName?: string | null;
  companyName?: string | null;
  companyLogo?: string | null;
  apiVersion?: string | null;
  provider?: string | null;
  permissions?: string[];
  accessTokenStatus?: string | null;
  instagramBusinessId?: string | null;
  pageName?: string | null;
  providerCapabilities?: Record<string, boolean> | null;
  permissionStatus?: string | null;
  connectionMetadata?: Record<string, unknown> | null;
  lastValidatedAt?: string | null;
  lastPublishAt?: string | null;
  lastError?: string | null;
}

export interface BrandSettings {
  companyName: string;
  website: string;
  language: string;
  timeZone: string;
  brandColor: string;
  signature: string;
}

export interface HealthItem {
  id: string;
  label: string;
  value: string;
}

// SecurityCenter card item shape (referenced by components/company-social/SecurityCenter.tsx).
export interface SecurityItem {
  id: string;
  label: string;
  value: string;
  status?: "ok" | "warn" | "error";
  detail?: string;
}

export interface PostingPermissionItem {
  label: string;
  requiresApproval: boolean;
}

export interface PermissionItem {
  role: string;
  access: string;
}

// Activity timeline entry (referenced by data/company-social.ts).
export interface ActivityItem {
  id: string;
  action: string;
  target?: string;
  platform?: string;
  actor?: string;
  timestamp: string;
}

export const PLATFORM_META: Record<
  SocialPlatform,
  { label: string; color: string; icon: string }
> = {
  FACEBOOK: { label: "Facebook", color: "#1877F2", icon: "facebook" },
  INSTAGRAM: { label: "Instagram", color: "#E4405F", icon: "instagram" },
  LINKEDIN: { label: "LinkedIn", color: "#0A66C2", icon: "linkedin" },
  YOUTUBE: { label: "YouTube", color: "#FF0000", icon: "youtube" },
  X: { label: "X (Twitter)", color: "#1DA1F2", icon: "x" },
  WEBSITE: { label: "Website", color: "#94A3B8", icon: "globe" },
};

export const STATUS_META: Record<PlatformStatus, { label: string; className: string; dot: string }> = {
  CONNECTED: { label: "Connected", className: "border-emerald-500/40 text-emerald-200", dot: "bg-emerald-400" },
  EXPIRING_SOON: { label: "Expiring Soon", className: "border-amber-500/40 text-amber-200", dot: "bg-amber-400" },
  DISCONNECTED: { label: "Disconnected", className: "border-red-500/40 text-red-200", dot: "bg-red-400" },
  PERMISSION_ERROR: { label: "Permission Error", className: "border-rose-500/40 text-rose-200", dot: "bg-rose-400" },
};
