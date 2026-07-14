// ===========================================================================
// TASK-51 — lib/analytics/mapper.ts
// Maps real aggregated data into the existing AnalyticsDataset shape consumed
// by the dashboard components. NO fabrication: unavailable platforms get
// available:false so the UI shows "No Data Available".
// ===========================================================================

import type { AggregatedAnalytics } from "./aggregator";
import type { PlatformFetchResult } from "./types";
import type {
  AnalyticsDataset,
  AudienceInsight,
  KpiSnapshot,
  PlatformAnalytics,
  TopContent,
  TrendPoint,
  AiInsight,
  ActivityItem,
} from "@/types/analytics";
import type { PlatformKey } from "@/types/contentPlanner";

const EMPTY_TREND: TrendPoint[] = [];
const EMPTY_HEATMAP: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));

function fb(p: PlatformFetchResult | undefined) {
  return p && p.available && p.connected ? p.metrics : null;
}

export function toDataset(a: AggregatedAnalytics): AnalyticsDataset {
  const fbP = a.platforms.find((p) => p.platform === "facebook");
  const fbm = fb(fbP);

  const kpi: KpiSnapshot = {
    totalReach: fbm?.reach ?? 0,
    totalImpressions: fbm?.impressions ?? 0,
    totalEngagement: fbm?.engagement ?? 0,
    followersGrowth: fbm?.followers ?? 0,
    publishedPosts: fbm?.posts ?? 0,
    aiGeneratedContent: 0, // no real source yet
    pendingScheduledPosts: 0,
    automationSuccessRate: 0,
    followersGrowthPct: fbm?.followersGrowthPct ?? 0,
  };

  const platformAnalytics: PlatformAnalytics[] = a.platforms.map((p) => ({
    platform: p.platform as PlatformKey,
    reach: p.metrics?.reach ?? 0,
    engagement: p.metrics?.engagement ?? 0,
    followers: p.metrics?.followers ?? 0,
    posts: p.metrics?.posts ?? 0,
    growthPct: p.metrics?.followersGrowthPct ?? 0,
    status: p.available && p.connected ? "healthy" : "attention",
    available: p.available,
    lastSync: p.lastSync ?? null,
  }));

  const topContent: TopContent[] = (fbm?.topPosts ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    platform: "facebook" as PlatformKey,
    thumbnailColor: "#1877F2",
    reach: t.reach ?? 0,
    likes: t.likes ?? 0,
    comments: t.comments ?? 0,
    shares: t.shares ?? 0,
    engagementRate: t.engagementRate ?? 0,
  }));

  const audience: AudienceInsight = {
    activeHours: [],
    bestPostingTime: "—",
    topCountries: [],
    topCities: [],
    deviceBreakdown: [],
  };

  const ai: AiInsight = {
    bestContentType: "—",
    recommendedPostingTime: "—",
    suggestedPlatform: "facebook" as PlatformKey,
    performanceSummary: fbm
      ? `Facebook live data: ${fbm.followers ?? "?"} followers, ${fbm.posts ?? 0} recent posts, ${fbm.messages ?? 0} inbox threads.`
      : "No connected platform data available.",
    recommendations: fbm
      ? ["Respond to the " + (fbm.messages ?? 0) + " open inbox threads to lift engagement."]
      : ["Connect a platform (Facebook/Instagram/LinkedIn) to unlock AI insights."],
  };

  const activity: ActivityItem[] = (fbm?.topPosts ?? []).map((t, i) => ({
    id: "act-" + i,
    kind: "publish" as const,
    text: `Facebook post published: ${t.title.slice(0, 60)}`,
    time: "recent",
  }));

  return {
    kpi,
    reachTrend: EMPTY_TREND,
    engagementTrend: EMPTY_TREND,
    platformPerf: a.platforms.map((p) => ({
      platform: p.platform as PlatformKey,
      reach: p.metrics?.reach ?? 0,
      engagement: p.metrics?.engagement ?? 0,
      posts: p.metrics?.posts ?? 0,
    })),
    distribution: [],
    heatmap: EMPTY_HEATMAP,
    audienceGrowth: [],
    platformAnalytics,
    topContent,
    audience,
    ai,
    activity,
  };
}
