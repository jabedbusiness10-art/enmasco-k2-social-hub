// ===========================================================================
// TASK-51 — lib/analytics/aggregator.ts
// THE single data source for the Enterprise Intelligence Center.
// UI components MUST consume only this module (per architecture rule).
// Real APIs where credentials exist; explicit "no data" elsewhere.
// ===========================================================================

import { cacheGet, cacheSet } from "./cache";
import { computeHealth } from "./health";
import { getDecryptedToken, listAccounts, refreshMetaAccountIfNeeded } from "@/services/social/accounts";
import { metaGraphGet, classifyMetaError } from "@/services/meta/oauth";
import type { AnalyticsQuery, HealthSnapshot, PlatformFetchResult } from "./types";
import type { PlatformKey } from "@/types/contentPlanner";

const CACHE_TTL = 60_000; // 60s auto-refresh as specified

// Local thin wrapper around metaGraphGet returning .data (or {} on error).
async function gq(endpoint: string, token: string, params = ""): Promise<any> {
  const p = params ? Object.fromEntries(new URLSearchParams(params)) : {};
  const res = await metaGraphGet(endpoint, token, p);
  if (!res.ok) return { error: res.error };
  return res.data ?? {};
}

// TASK-74 — Read Graph insights via the shared, classified helper (no dup logic).
// Returns a map metric->value (latest period), or null on any Graph error.
async function metaInsights(
  token: string,
  id: string,
  metrics: string[],
  period: "day" | "week" | "days_28" | "lifetime" = "day",
): Promise<Record<string, number | null> | null> {
  const res = await metaGraphGet(`${id}/insights`, token, {
    metric: metrics.join(","),
    period,
    limit: "1",
  });
  if (!res.ok || !res.data?.data) return null;
  const out: Record<string, number | null> = {};
  for (const m of res.data.data as any[]) {
    const v = m?.values?.[0]?.value;
    out[m.name] = typeof v === "number" ? v : null;
  }
  return out;
}

async function fetchInstagram(rangeDays: number): Promise<PlatformFetchResult> {
  try {
    const accounts = await listAccounts();
    const ig = accounts.find((a) => a.platform === "INSTAGRAM" && a.status === "CONNECTED");
    if (!ig || !ig.instagramBusinessId) {
      return { platform: "instagram", label: "Instagram", connected: false, available: true, lastSync: null, metrics: null, error: "No connected Instagram Business account" };
    }
    // TASK-74 — ensure a non-expired token is available before reading insights.
    await refreshMetaAccountIfNeeded(ig.id).catch(() => {});
    const token = await getDecryptedToken(ig.id);
    if (!token) {
      return { platform: "instagram", label: "Instagram", connected: false, available: true, lastSync: null, metrics: null, error: "Token missing or decrypt failed" };
    }
    const igId = ig.instagramBusinessId;

    const igInsights = await metaInsights(
      token,
      igId,
      ["impressions", "reach", "engagement", "follower_count", "profile_visits", "saved"],
      "day",
    ).catch(() => null);

    const media = await metaGraphGet(`${igId}/media`, token, {
      fields: "id,caption,media_type,like_count,comments_count,permalink,timestamp",
      limit: "10",
    }).catch(() => null);
    const mediaItems = media?.ok ? (media.data.data ?? []) : [];

    const followers = igInsights?.follower_count ?? null;
    const fetchedAt = new Date().toISOString();

    return {
      platform: "instagram",
      label: "Instagram",
      connected: true,
      available: true,
      lastSync: fetchedAt,
      metrics: {
        followers,
        reach: igInsights?.reach ?? null,
        impressions: igInsights?.impressions ?? null,
        engagement: igInsights?.engagement ?? null,
        engagementRate: null,
        posts: mediaItems.length,
        messages: null,
        comments: null,
        shares: null,
        videoViews: null,
        clicks: null,
        visitors: igInsights?.profile_visits ?? null,
        followersGrowthPct: null,
        topPosts: mediaItems.slice(0, 5).map((m: any) => ({
          id: m.id,
          title: (m.caption ?? "(no caption)").slice(0, 80),
          url: m.permalink ?? null,
          reach: null,
          likes: m.like_count ?? 0,
          comments: m.comments_count ?? 0,
          shares: null,
          engagementRate: null,
          mediaType: m.media_type ?? null,
          mediaUrl: null,
        })),
      },
    };
  } catch (e: any) {
    return { platform: "instagram", label: "Instagram", connected: false, available: true, lastSync: null, metrics: null, error: e?.message ?? "Fetch failed" };
  }
}

async function fetchFacebook(rangeDays: number): Promise<PlatformFetchResult> {
  try {
    const accounts = await listAccounts();
    const fb = accounts.find((a) => a.platform === "FACEBOOK" && a.status === "CONNECTED");
    if (!fb) {
      return {
        platform: "facebook",
        label: "Facebook",
        connected: false,
        available: true,
        lastSync: null,
        metrics: null,
        error: "No connected Facebook account",
      };
    }
    const token = await getDecryptedToken(fb.id);
    if (!token) {
      return {
        platform: "facebook",
        label: "Facebook",
        connected: false,
        available: true,
        lastSync: null,
        metrics: null,
        error: "Token missing or decrypt failed",
      };
    }
    const pageId = fb.pageId || fb.accountId;
    if (!pageId) {
      return {
        platform: "facebook",
        label: "Facebook",
        connected: false,
        available: true,
        lastSync: null,
        metrics: null,
        error: "Page ID not set",
      };
    }
    const info = await gq(pageId, token, "fields=name,fan_count,followers_count,category,link");
    if (info.error) {
      return {
        platform: "facebook",
        label: "Facebook",
        connected: false,
        available: true,
        lastSync: null,
        metrics: null,
        error: `Graph API: ${info.error.message}`,
      };
    }
    const basePosts = await gq(`${pageId}/posts`, token, "fields=message,created_time,permalink_url&limit=8").catch(() => ({ data: [] }));
    const convsRaw = await gq(`${pageId}/conversations`, token, "fields=id,snippet,updated_time&limit=10").catch(() => ({ data: [] }));

    const followers = info.followers_count ?? info.fan_count ?? null;
    const posts = basePosts.data ?? [];
    const msgs = convsRaw.data ?? [];

    // TASK-74 — Facebook Page Insights (real Graph data; null when scope/token
    // lacks read_insights — never fabricated).
    const pageInsights = await metaInsights(
      token,
      pageId,
      [
        "page_impressions",
        "page_reach",
        "page_engaged_users",
        "page_views_total",
        "page_posts_impressions",
        "page_fan_adds",
      ],
      "day",
    ).catch(() => null);

    // Per-post insights for the top posts (reach/impressions/likes/comments/shares).
    const topPosts = await Promise.all(
      posts.slice(0, 5).map(async (p: any) => {
        const pi = await metaInsights(
          token,
          p.id,
          ["post_impressions", "post_reach", "post_engaged_users"],
          "lifetime",
        ).catch(() => null);
        return {
          id: p.id,
          title: (p.message ?? "(no caption)").slice(0, 80),
          url: p.permalink_url ?? null,
          reach: pi?.post_reach ?? null,
          likes: 0, // likes need pages_read_engagement; posts.insights covers reach/impressions
          comments: null,
          shares: null,
          engagementRate: null,
          mediaType: null,
          mediaUrl: null,
        };
      }),
    );

    const impressions = pageInsights?.page_impressions ?? null;
    const reach = pageInsights?.page_reach ?? null;
    const engagement = pageInsights?.page_engaged_users ?? null;
    const pageViews = pageInsights?.page_views_total ?? null;
    const fanAdds = pageInsights?.page_fan_adds ?? null;

    const fetchedAt = new Date().toISOString();

    return {
      platform: "facebook",
      label: "Facebook",
      connected: true,
      available: true,
      lastSync: fetchedAt,
      metrics: {
        followers,
        reach,
        impressions,
        engagement,
        engagementRate: null,
        posts: posts.length,
        messages: msgs.length,
        comments: null,
        shares: null,
        videoViews: null,
        clicks: null,
        visitors: pageViews,
        followersGrowthPct: null,
        topPosts,
        fanAdds,
      },
    };
  } catch (e: any) {
    return {
      platform: "facebook",
      label: "Facebook",
      connected: false,
      available: true,
      lastSync: null,
      metrics: null,
      error: e?.message ?? "Fetch failed",
    };
  }
}

// Platforms without real API integrations => explicit "no data".
function unavailable(platform: PlatformKey, label: string): PlatformFetchResult {
  return {
    platform,
    label,
    connected: false,
    available: false,
    lastSync: null,
    metrics: null,
    error: "No integration configured",
  };
}

export interface AggregatedAnalytics {
  query: AnalyticsQuery;
  platforms: PlatformFetchResult[];
  health: HealthSnapshot;
  generatedAt: string;
}

export async function aggregateAnalytics(query: AnalyticsQuery): Promise<AggregatedAnalytics> {
  const cacheKey = `analytics:${query.range}:${(query.platforms || []).join(",")}`;
  const cached = cacheGet<AggregatedAnalytics>(cacheKey);
  if (cached) return cached;

  const rangeDays =
    query.range === "today" ? 1 : query.range === "7d" ? 7 : query.range === "30d" ? 30 : 30;

  const all: PlatformFetchResult[] = [
    await fetchFacebook(rangeDays),
    await fetchInstagram(rangeDays),
    unavailable("linkedin", "LinkedIn"),
    unavailable("x", "X"),
    unavailable("youtube", "YouTube"),
    unavailable("tiktok", "TikTok"),
  ];

  // Apply platform filter (empty = all)
  const filtered = query.platforms && query.platforms.length
    ? all.filter((p) => query.platforms.includes(p.platform))
    : all;

  const result: AggregatedAnalytics = {
    query,
    platforms: filtered,
    health: computeHealth(all),
    generatedAt: new Date().toISOString(),
  };
  cacheSet(cacheKey, result, CACHE_TTL);
  return result;
}

/** Convenience: only the platforms that actually returned real data. */
export function connectedPlatforms(a: AggregatedAnalytics): PlatformFetchResult[] {
  return a.platforms.filter((p) => p.available && p.connected && p.metrics);
}
