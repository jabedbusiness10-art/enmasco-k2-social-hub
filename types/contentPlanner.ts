// ============================================================================
// Company Content Planner — domain types
// Reusable, database-ready interfaces. No external API integration yet; all
// data currently flows from local mock fixtures (see @/data/contentPlanner).
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

/** A single social platform the company publishes to. */
export interface Platform {
  key: PlatformKey;
  name: string;
  /** Brand color (hex) used for badges and colorful calendar cards. */
  color: string;
  /** Short monogram shown inside the platform chip. */
  short: string;
}

/** Company department that owns a piece of content. */
export interface Department {
  id: string;
  name: string;
}

/** Marketing campaign a piece of content can belong to. */
export interface Campaign {
  id: string;
  name: string;
  color: string;
  status: "PLANNED" | "ACTIVE" | "COMPLETED";
  startDate?: string;
  endDate?: string;
}

/** Internal company user (creator / assignee). Not a public end-user. */
export interface User {
  id: string;
  name: string;
  /** Avatar background color. */
  color: string;
  role?: string;
}

/** When + how the content should go out. */
export interface Schedule {
  /** ISO 8601 publication time. */
  scheduledAt: string;
  timezone: string;
  recurrence: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";
  publishedAt?: string;
  failedReason?: string;
}

/** Approval workflow state for the piece of content. */
export interface Approval {
  status: ApprovalStatus;
  requestedAt?: string;
  decidedAt?: string;
  decidedBy?: string;
  note?: string;
}

export type MediaType = "IMAGE" | "VIDEO" | "CAROUSEL" | "NONE";

export interface ContentMedia {
  id: string;
  type: MediaType;
  /** Local mock path; swap for a CDN/Cloudinary URL on DB integration. */
  url?: string;
  alt?: string;
}

export interface ContentPerformance {
  impressions: number;
  engagements: number;
  clicks: number;
  reach: number;
}

/** The core entity: one planned piece of company content. */
export interface ContentPlan {
  id: string;
  title: string;
  caption: string;
  platform: PlatformKey;
  status: ContentStatus;
  schedule: Schedule;
  approval: Approval;
  campaignId?: string;
  departmentId?: string;
  /** Author of the draft. */
  creatorId: string;
  /** Person currently responsible for the item. */
  assigneeId?: string;
  media?: ContentMedia;
  hashtags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  performance?: ContentPerformance;
}

/** A row in the bottom "Recent Planning Activity" timeline. */
export interface PlanningActivity {
  id: string;
  type: "CREATED" | "SCHEDULED" | "PUBLISHED" | "APPROVED" | "REJECTED" | "EDITED" | "COMMENT" | "FAILED";
  contentId?: string;
  contentTitle?: string;
  actorName: string;
  at: string;
  detail?: string;
}

export type CalendarView = "month" | "week" | "day" | "agenda";

/** Active filter state shared across the toolbar and the left sidebar. */
export interface PlannerFilters {
  search: string;
  platforms: PlatformKey[];
  statuses: ContentStatus[];
  departmentId?: string;
  campaignId?: string;
  creatorId?: string;
  /** Inclusive ISO date range (YYYY-MM-DD) or undefined = no bound. */
  dateFrom?: string;
  dateTo?: string;
}
