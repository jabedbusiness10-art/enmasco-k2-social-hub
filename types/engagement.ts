// TASK-43 Reactions & Engagement Monitor — domain types
// Platforms: live (FB/IG/LinkedIn) + future-ready (X/TikTok/YouTube).

export type EngagementPlatform =
  | "facebook"
  | "instagram"
  | "linkedin"
  | "x"
  | "tiktok"
  | "youtube";

export type ReactionType =
  | "LIKE"
  | "LOVE"
  | "HAHA"
  | "WOW"
  | "SAD"
  | "ANGRY"
  | "COMMENT"
  | "SHARE"
  | "SAVE";

// One premium statistic card on the overview.
export interface EngagementStat {
  key: ReactionType | "REACH" | "ENGAGEMENT_RATE";
  label: string;
  icon: string; // emoji per spec
  total: number;
  growth: number; // percentage, can be negative
  trend: number[]; // mini sparkline points
}

export interface ActivityItem {
  id: string;
  platform: EngagementPlatform;
  customer: string;
  avatar: string; // initials or image url
  reaction: ReactionType;
  postPreview: string;
  at: string; // ISO timestamp
}

export interface TopPost {
  id: string;
  platform: EngagementPlatform;
  caption: string;
  thumbnail: string; // url or initials/color placeholder
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  engagementRate: number; // percentage
  createdAt: string; // ISO
}

// Mock series for charts (recharts).
export interface ChartPoint {
  label: string;
  value: number;
}

export interface PlatformDatum {
  platform: EngagementPlatform;
  value: number;
}

export interface ReactionDatum {
  type: ReactionType;
  value: number;
}

export interface LiveStatus {
  monitoring: boolean;
  lastSync: string; // ISO
  dataSource: string;
  refresh: "live" | "syncing" | "idle";
}

export interface EngagementData {
  stats: EngagementStat[];
  activity: ActivityItem[];
  topPosts: TopPost[];
  daily: ChartPoint[];
  weekly: ChartPoint[];
  monthly: ChartPoint[];
  platformComparison: PlatformDatum[];
  reactionDistribution: ReactionDatum[];
  growthTrend: ChartPoint[];
  live: LiveStatus;
}
