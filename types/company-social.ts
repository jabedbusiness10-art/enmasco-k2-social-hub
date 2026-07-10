export type SocialPlatform = "FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "YOUTUBE" | "X" | "WEBSITE";
export type PlatformStatus = "CONNECTED" | "EXPIRING_SOON" | "DISCONNECTED" | "PERMISSION_ERROR";

export interface CompanySocialAccount {
  id: string;
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
