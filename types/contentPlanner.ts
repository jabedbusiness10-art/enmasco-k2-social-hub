// ============================================================================
// Company Content Planner — domain types
// ============================================================================

export type PlatformKey =
  | "facebook"
  | "instagram"
  | "linkedin"
  | "x"
  | "youtube"
  | "tiktok";

export type ContentStatus =
  | "DRAFT"
  | "REVIEW"
  | "APPROVED"
  | "SCHEDULED"
  | "PUBLISHED"
  | "FAILED";

export type ApprovalStatus =
  | "NOT_REQUIRED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface Platform {
  key: PlatformKey;
  name: string;
  color: string;
  short: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Campaign {
  id: string;
  name: string;
  color?: string;
  status: "PLANNED" | "ACTIVE" | "COMPLETED";
  startDate?: string;
  endDate?: string;
}

export interface User {
  id: string;
  name: string;
  color?: string;
  role?: string;
}

export interface Schedule {
  scheduledAt: string;
  timezone: string;
  recurrence: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";
  publishedAt?: string;
  failedReason?: string;
}

export interface Approval {
  status: ApprovalStatus;
  requestedAt?: string;
  decidedAt?: string;
  decidedBy?: string;
  note?: string;
}

export type MediaType = "IMAGE" | "VIDEO" | "REEL" | "CAROUSEL" | "NONE";

export interface ContentMedia {
  id?: string;
  type: MediaType;
  url: string;
  thumbnail?: string | null;
  alt?: string | null;
  order?: number;
}

export interface ContentPlatform {
  id?: string;
  platform: PlatformKey;
  accountId?: string | null;
  status?: string;
}

export interface ContentPerformance {
  impressions: number;
  engagements: number;
  clicks: number;
  reach: number;
}

export interface ContentPlan {
  id: string;
  title: string;
  caption: string;
  platform: PlatformKey;
  platforms?: ContentPlatform[];
  status: ContentStatus;
  schedule: Schedule;
  approval: Approval;
  campaignId?: string;
  departmentId?: string;
  creatorId: string;
  assigneeId?: string;
  media: ContentMedia[];
  hashtags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  category?: string;
  priority?: string;
  labels?: string[];
  performance?: ContentPerformance;
}

export interface PlanningActivity {
  id: string;
  type: "CREATED" | "EDITED" | "FAILED" | "SCHEDULED" | "PUBLISHED" | "APPROVED" | "REJECTED" | "COMMENT";
  contentId?: string;
  contentTitle?: string;
  actorName: string;
  at: string;
  detail?: string;
}

export type CalendarView = "month" | "week" | "day" | "agenda";

export interface PlannerFilters {
  search: string;
  platforms: PlatformKey[];
  statuses: ContentStatus[];
  departmentId?: string;
  campaignId?: string;
  creatorId?: string;
  dateFrom?: string;
  dateTo?: string;
}
