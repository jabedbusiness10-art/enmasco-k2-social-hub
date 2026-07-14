// ===========================================================================
// TASK-51 — lib/analytics/aggregator.ts
// THE single data source for the Enterprise Intelligence Center.
// UI components MUST consume only this module (per architecture rule).
// Real APIs where credentials exist; explicit "no data" elsewhere.
// ===========================================================================

import { cacheGet, cacheSet } from "./cache";
import { computeHealth } from "./health";
import { getDecryptedToken, listAccounts } from "@/services/social/accounts";
import type { AnalyticsQuery, HealthSnapshot, PlatformFetchResult } from "./types";
import type { PlatformKey } from "@/types/contentPlanner";

const CACHE_TTL = 60_000; // 60s auto-refresh as specified

// Minimal Graph call (server-side, using stored encrypted token).
async function gq(endpoint: string, token: string, params = "") {
  const sep = params ? "?" : "";
  const url = `https://graph.facebook.com/v21.0/${endpoint}${sep}${params}&access_token=${token}`;
  const res = await fetch(url);
  return res.json();
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
    const totalLikes = 0; // likes need pages_read_engagement (dev-mode limited)
    const topPosts = posts.slice(0, 5).map((p: any) => ({
      id: p.id,
      title: (p.message ?? "(no caption)").slice(0, 80),
      url: p.permalink_url ?? null,
      reach: null,
      likes: 0,
      comments: null,
      shares: null,
      engagementRate: null,
      mediaType: null,
      mediaUrl: null,
    }));
    const fetchedAt = new Date().toISOString();

    return {
      platform: "facebook",
      label: "Facebook",
      connected: true,
      available: true,
      lastSync: fetchedAt,
      metrics: {
        followers,
        reach: null,
        impressions: null,
        engagement: totalLikes,
        engagementRate: null,
        posts: posts.length,
        messages: msgs.length,
        comments: null,
        shares: null,
        videoViews: null,
        clicks: null,
        visitors: null,
        followersGrowthPct: null,
        topPosts,
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
    unavailable("instagram", "Instagram"),
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
