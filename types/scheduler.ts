// TASK-40 Real Publishing Scheduler — domain types
// Status set aligned with the spec (premium scheduling pipeline).
// Platform list is live (FB/IG/LinkedIn) + future-ready (X/TikTok).

export type PlatformKey =
  | "facebook"
  | "instagram"
  | "linkedin"
  | "x"
  | "tiktok";

export type PostStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "PUBLISHING"
  | "PUBLISHED"
  | "FAILED"
  | "CANCELLED";

export type ViewMode = "month" | "week" | "day";

export interface ScheduledPost {
  id: string;
  title: string;
  caption: string;
  platform: PlatformKey;
  mediaUrl?: string;
  hashtags: string[];
  /** ISO datetime string, already timezone-aware in storage */
  scheduledAt: string;
  status: PostStatus;
  owner: string;
  campaign?: string;
  /** IANA timezone, e.g. "Asia/Riyadh" */
  timezone: string;
  /** Soft-red, premium glow accent used by calendar events / cards */
  accent: "red" | "sky" | "violet" | "emerald" | "amber" | "rose";
}

export const PLATFORM_LABELS: Record<PlatformKey, string> = {
  facebook: "Facebook Page",
  instagram: "Instagram Business",
  linkedin: "LinkedIn Company",
  x: "X (Twitter)",
  tiktok: "TikTok",
};

export const STATUS_LABELS: Record<PostStatus, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  PUBLISHING: "Publishing",
  PUBLISHED: "Published",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};
