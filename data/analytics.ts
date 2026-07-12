// ============================================================================
// Live Analytics Dashboard — mock data + selector
// ----------------------------------------------------------------------------
// This is the ONLY data source the UI depends on. To wire a real backend,
// replace `buildAnalytics()` with a fetcher keyed by `AnalyticsQuery`
// (range + platform filter). Every component below consumes the typed
// `AnalyticsDataset` shape, so no UI change is required on integration.
// ============================================================================

import type {
  AnalyticsDataset,
  AnalyticsQuery,
  DateRangeKey,
  PlatformAnalytics,
  PlatformKey,
  TrendPoint,
  ActivityItem,
} from "@/types/analytics";

const PLATFORMS: PlatformKey[] = ["facebook", "instagram", "linkedin", "x", "youtube", "tiktok"];

const PLATFORM_COLORS: Record<PlatformKey, string> = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  linkedin: "#0A66C2",
  x: "#E7E9EA",
  youtube: "#FF0000",
  tiktok: "#FE2C55",
};

// ---- Deterministic pseudo-random so mock data is stable across renders ----
function seeded(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const RANGE_DAYS: Record<DateRangeKey, number> = {
  today: 1,
  "7d": 7,
  "30d": 30,
  month: 30,
  custom: 14,
};

function makeTrend(seedBase: number, days: number, base: number, volatility: number): TrendPoint[] {
  const rnd = seeded(seedBase);
  const pts: TrendPoint[] = [];
  let v = base;
  for (let i = days - 1; i >= 0; i--) {
    v = Math.max(200, v + (rnd() - 0.45) * volatility);
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = days <= 1 ? d.toLocaleTimeString([], { hour: "2-digit" }) : `${d.getMonth() + 1}/${d.getDate()}`;
    pts.push({ label, value: Math.round(v) });
  }
  return pts;
}

function makePlatformAnalytics(): PlatformAnalytics[] {
  const meta: Record<PlatformKey, { reach: number; engagement: number; followers: number; posts: number; growthPct: number; status: PlatformAnalytics["status"] }> = {
    facebook: { reach: 482000, engagement: 3.4, followers: 120400, posts: 42, growthPct: 2.1, status: "growing" },
    instagram: { reach: 912000, engagement: 6.8, followers: 318900, posts: 61, growthPct: 4.7, status: "growing" },
    linkedin: { reach: 274000, engagement: 2.1, followers: 64200, posts: 28, growthPct: -0.8, status: "declining" },
    x: { reach: 356000, engagement: 1.9, followers: 88900, posts: 53, growthPct: 0.4, status: "healthy" },
    youtube: { reach: 1120000, engagement: 5.2, followers: 184500, posts: 19, growthPct: 7.3, status: "growing" },
    tiktok: { reach: 1580000, engagement: 9.1, followers: 401200, posts: 34, growthPct: 12.6, status: "growing" },
  };
  return PLATFORMS.map((p) => ({
    platform: p,
    reach: meta[p].reach,
    engagement: meta[p].engagement,
    followers: meta[p].followers,
    posts: meta[p].posts,
    growthPct: meta[p].growthPct,
    status: meta[p].status,
  }));
}

function makeHeatmap(): number[][] {
  // 7 days x 24 hours, intensity 0-100 weighted toward business hours.
  const rnd = seeded(99);
  const m: number[][] = [];
  for (let d = 0; d < 7; d++) {
    const row: number[] = [];
    for (let h = 0; h < 24; h++) {
      let intensity = 8 + rnd() * 18;
      if (h >= 8 && h <= 11) intensity += 35 + rnd() * 20; // morning
      if (h >= 18 && h <= 22) intensity += 45 + rnd() * 25; // evening peak
      if (d >= 5) intensity *= 0.7; // weekends quieter
      row.push(Math.min(100, Math.round(intensity)));
    }
    m.push(row);
  }
  return m;
}

function makeActivity(): ActivityItem[] {
  return [
    { id: "a1", kind: "publish", text: "Sara Khan published “Eid Mega Sale Reveal” to Instagram", time: "2m ago" },
    { id: "a2", kind: "ai", text: "K2Kai generated 3 caption variants for TikTok campaign", time: "9m ago" },
    { id: "a3", kind: "scheduled", text: "“Founder Live — X Space” scheduled by MD Kazim", time: "21m ago" },
    { id: "a4", kind: "team", text: "Arif Rahman moved “Behind the Brand” to Review", time: "34m ago" },
    { id: "a5", kind: "failed", text: "“Product Launch Teaser” failed on YouTube — retrying", time: "51m ago" },
    { id: "a6", kind: "publish", text: "Nusrat Jahan published “Customer Story — Rahim Traders” to LinkedIn", time: "1h ago" },
    { id: "a7", kind: "ai", text: "AI auto-tagged 12 new media assets in Media Library", time: "1h ago" },
    { id: "a8", kind: "scheduled", text: "“Weekly Deals Drop” queued for X at 6:00 PM", time: "2h ago" },
  ];
}

// The single source-of-truth builder. Swap this for a real API later.
export function buildAnalytics(query: AnalyticsQuery): AnalyticsDataset {
  const days = RANGE_DAYS[query.range];
  const filter = query.platforms.length ? query.platforms : PLATFORMS;

  const reachTrend = makeTrend(11, days, 24000, 9000);
  const engagementTrend = makeTrend(73, days, 1600, 700);
  const audienceGrowth = reachTrend.map((p, i) => ({
    label: p.label,
    followers: 900000 + i * 1900 + Math.round(1900 * (i / days)),
  }));

  const allPlatform = makePlatformAnalytics();
  const platformAnalytics = allPlatform.filter((p) => filter.includes(p.platform));

  const platformPerf = platformAnalytics.map((p) => ({
    platform: p.platform,
    reach: p.reach,
    engagement: Math.round(p.reach * (p.engagement / 100)),
    posts: p.posts,
  }));

  const distribution = platformAnalytics.map((p) => ({
    label: p.platform,
    value: p.posts,
    color: PLATFORM_COLORS[p.platform],
  }));

  const topContent = [
    { id: "t1", title: "Behind the Brand — TikTok AR", platform: "tiktok" as PlatformKey, thumbnailColor: "#FE2C55", reach: 482000, likes: 41200, comments: 3120, shares: 9800, engagementRate: 11.2 },
    { id: "t2", title: "Eid Mega Sale Reveal", platform: "instagram" as PlatformKey, thumbnailColor: "#E4405F", reach: 364000, likes: 28900, comments: 1980, shares: 5400, engagementRate: 9.8 },
    { id: "t3", title: "Founder Live — X Space", platform: "x" as PlatformKey, thumbnailColor: "#E7E9EA", reach: 211000, likes: 8900, comments: 4210, shares: 1700, engagementRate: 7.4 },
    { id: "t4", title: "Customer Story — Rahim Traders", platform: "linkedin" as PlatformKey, thumbnailColor: "#0A66C2", reach: 142000, likes: 6200, comments: 980, shares: 760, engagementRate: 5.6 },
    { id: "t5", title: "Unboxing — New Drop", platform: "youtube" as PlatformKey, thumbnailColor: "#FF0000", reach: 528000, likes: 33400, comments: 5210, shares: 2100, engagementRate: 8.1 },
    { id: "t6", title: "We're Hiring — Engineering", platform: "facebook" as PlatformKey, thumbnailColor: "#1877F2", reach: 168000, likes: 7400, comments: 610, shares: 440, engagementRate: 4.9 },
  ].filter((t) => filter.includes(t.platform));

  const dataset: AnalyticsDataset = {
    kpi: {
      totalReach: platformAnalytics.reduce((s, p) => s + p.reach, 0),
      totalImpressions: platformAnalytics.reduce((s, p) => s + Math.round(p.reach * 1.8), 0),
      totalEngagement: platformAnalytics.reduce((s, p) => s + Math.round(p.reach * (p.engagement / 100)), 0),
      followersGrowth: platformAnalytics.reduce((s, p) => s + Math.round(p.followers * (p.growthPct / 100)), 0),
      publishedPosts: platformAnalytics.reduce((s, p) => s + Math.round(p.posts * 0.82), 0),
      aiGeneratedContent: 128,
      pendingScheduledPosts: 19,
      automationSuccessRate: 97.3,
      followersGrowthPct: 9.2,
    },
    reachTrend,
    engagementTrend,
    platformPerf,
    distribution,
    heatmap: makeHeatmap(),
    audienceGrowth,
    platformAnalytics,
    topContent,
    audience: {
      activeHours: Array.from({ length: 24 }, (_, h) => {
        const v = h >= 8 && h <= 11 ? 60 + ((h * 7) % 35) : h >= 18 && h <= 22 ? 70 + ((h * 5) % 28) : 10 + ((h * 3) % 22);
        return { hour: h, value: v };
      }),
      bestPostingTime: "8:00 PM – 10:00 PM",
      topCountries: [
        { country: "Bangladesh", value: 38 },
        { country: "United States", value: 21 },
        { country: "India", value: 14 },
        { country: "UAE", value: 11 },
        { country: "United Kingdom", value: 9 },
      ],
      topCities: [
        { city: "Dhaka", value: 31 },
        { city: "New York", value: 14 },
        { city: "Dubai", value: 11 },
        { city: "London", value: 9 },
        { city: "Chittagong", value: 8 },
      ],
      deviceBreakdown: [
        { device: "Mobile", value: 68, color: "#38BDF8" },
        { device: "Desktop", value: 24, color: "#FB7185" },
        { device: "Tablet", value: 8, color: "#A78BFA" },
      ],
    },
    ai: {
      bestContentType: "Short-form vertical video (TikTok / Reels)",
      recommendedPostingTime: "Tue–Thu, 8:00 PM",
      suggestedPlatform: "tiktok",
      performanceSummary:
        "TikTok and YouTube are driving the highest reach this period. Short-form video outperforms static posts by 2.3× on engagement rate. Automation workflows succeeded on 97.3% of runs.",
      recommendations: [
        "Shift 20% of static budget into TikTok vertical videos",
        "Schedule LinkedIn thought-leadership posts on Tue mornings",
        "Enable AI auto-captioning for YouTube Shorts to lift watch time",
        "Reuse top-performing Reels as paid Instagram placements",
      ],
    },
    activity: makeActivity(),
  };

  return dataset;
}

export const ANALYTICS_PLATFORMS = PLATFORMS;
export const PLATFORM_COLOR = PLATFORM_COLORS;
