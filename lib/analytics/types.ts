// ===========================================================================
// TASK-51 — lib/analytics/types.ts
// Real-data analytics domain types. Extends the existing @/types/analytics
// with explicit "no data" signaling so the UI never fabricates metrics.
// ===========================================================================

import type { PlatformKey } from "@/types/contentPlanner";

/** A single platform's real fetch result. `null` when no API/credentials. */
export interface PlatformFetchResult {
  platform: PlatformKey;
  /** Human label, e.g. "Facebook". */
  label: string;
  /** True when a real API call succeeded and returned data. */
  connected: boolean;
  /** False when no integration/credentials exist (show "No Data Available"). */
  available: boolean;
  /** ISO timestamp of the last successful sync, or null. */
  lastSync: string | null;
  /** Raw normalized metrics (only populated when available && connected). */
  metrics: PlatformMetrics | null;
  /** Error message if the call failed (API down, token expired, etc). */
  error?: string | null;
}

export interface PlatformMetrics {
  followers: number | null;
  reach: number | null;
  impressions: number | null;
  engagement: number | null;
  engagementRate: number | null; // percentage 0-100
  posts: number | null;
  messages: number | null;
  comments: number | null;
  shares: number | null;
  videoViews: number | null;
  clicks: number | null;
  visitors: number | null;
  /** Period-over-period follower growth as a percentage (e.g. +5.2). */
  followersGrowthPct: number | null;
  /** Top posts (real, when available). */
  topPosts?: TopContentReal[];
}

export interface TopContentReal {
  id: string;
  title: string;
  url: string | null;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  engagementRate: number | null;
  mediaType: string | null;
  mediaUrl: string | null;
}

export type HealthStatus = "excellent" | "good" | "warning" | "critical";

export interface HealthComponent {
  key: string;
  label: string;
  status: HealthStatus;
  detail: string;
  score: number; // 0-100
}

export interface HealthSnapshot {
  overall: number; // 0-100
  status: HealthStatus;
  components: HealthComponent[];
  generatedAt: string;
}

export interface AnalyticsQuery {
  range: "today" | "7d" | "30d" | "month" | "custom";
  platforms: PlatformKey[];
}
