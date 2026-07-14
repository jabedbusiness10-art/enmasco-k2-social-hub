// ============================================================================
// Live Analytics Dashboard — domain types
// Reusable, database-ready interfaces. No external API integration yet; all
// data currently flows from local mock fixtures (see @/data/analytics).
// Swap the mock selector for a real fetcher later without touching the UI.
// ============================================================================

import type { PlatformKey } from "./contentPlanner";

export type { PlatformKey } from "./contentPlanner";

export type DateRangeKey = "today" | "7d" | "30d" | "month" | "custom";

/** Top-line KPI snapshot for the selected range + filters. */
export interface KpiSnapshot {
  totalReach: number;
  totalImpressions: number;
  totalEngagement: number;
  followersGrowth: number;
  publishedPosts: number;
  aiGeneratedContent: number;
  pendingScheduledPosts: number;
  /** Automation success rate as a percentage (0-100). */
  automationSuccessRate: number;
  /** Followers growth as a percentage rate for the period (e.g. +5.2). */
  followersGrowthPct: number;
}

export interface TrendPoint {
  /** ISO date or short label. */
  label: string;
  value: number;
}

export interface PlatformPerf {
  platform: PlatformKey;
  reach: number;
  engagement: number;
  posts: number;
}

export interface DistributionSlice {
  label: string;
  value: number;
  color: string;
}

/** Posting-activity heatmap: indexed [day][hour] with intensity 0-100. */
export type HeatmapMatrix = number[][];

export interface AudienceGrowthPoint {
  label: string;
  followers: number;
}

export type PlatformStatus = "healthy" | "growing" | "declining" | "attention";

export interface PlatformAnalytics {
  platform: PlatformKey;
  reach: number;
  engagement: number;
  followers: number;
  posts: number;
  /** Period-over-period growth as a percentage. */
  growthPct: number;
  status: PlatformStatus;
  /** TASK-51: false when no real API/credentials exist (show "No Data Available"). */
  available?: boolean;
  /** ISO timestamp of last successful sync, or null. */
  lastSync?: string | null;
}

export interface TopContent {
  id: string;
  title: string;
  platform: PlatformKey;
  /** Hex used for the generated thumbnail tile (no real media yet). */
  thumbnailColor: string;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  /** Engagement rate as a percentage. */
  engagementRate: number;
}

export interface AudienceInsight {
  /** Engagement intensity by hour-of-day (0-23), 0-100. */
  activeHours: { hour: number; value: number }[];
  bestPostingTime: string;
  topCountries: { country: string; value: number }[];
  topCities: { city: string; value: number }[];
  deviceBreakdown: { device: string; value: number; color: string }[];
}

export interface AiInsight {
  bestContentType: string;
  recommendedPostingTime: string;
  suggestedPlatform: PlatformKey;
  performanceSummary: string;
  recommendations: string[];
}

export type ActivityKind = "publish" | "scheduled" | "failed" | "ai" | "team";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  text: string;
  /** Human-readable relative time, e.g. "2m ago". */
  time: string;
}

/** The complete analytics payload rendered by the dashboard. */
export interface AnalyticsDataset {
  kpi: KpiSnapshot;
  reachTrend: TrendPoint[];
  engagementTrend: TrendPoint[];
  platformPerf: PlatformPerf[];
  distribution: DistributionSlice[];
  heatmap: HeatmapMatrix;
  audienceGrowth: AudienceGrowthPoint[];
  platformAnalytics: PlatformAnalytics[];
  topContent: TopContent[];
  audience: AudienceInsight;
  ai: AiInsight;
  activity: ActivityItem[];
}

/** Inputs to the data selector — the single seam for future API integration. */
export interface AnalyticsQuery {
  range: DateRangeKey;
  /** Optional platform filter; empty means "all platforms". */
  platforms: PlatformKey[];
}
