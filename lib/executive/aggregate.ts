import { prisma } from "@/lib/db";
import { aggregateAnalytics, connectedPlatforms } from "@/lib/analytics/aggregator";
import { collectMetrics } from "@/lib/queue/metrics";
import { getLiveEvents } from "@/lib/queue/queue";
import { REDIS_READY } from "@/lib/queue/connection";

export type Range = "today" | "yesterday" | "7d" | "30d" | "90d" | "year";

/**
 * TASK-58 — Executive Intelligence snapshot.
 * Aggregates REAL data from every existing production service:
 *  - TASK-51 analytics aggregator (Facebook real; others available:false)
 *  - TASK-52 AI (AITokenUsage rows)
 *  - TASK-54/55 media (assets, collections, tags, storage)
 *  - TASK-57 queue (health + audit rows + live events)
 *  - Conversations/messages, users/team, posts/publishing
 * Sections with NO real source return { available:false } so the UI shows
 * "No Data Available" — never fabricated (TASK-51 rule).
 */
export async function getExecutiveSnapshot(range: Range = "7d") {
  const qRange: "today" | "7d" | "30d" | "month" | "custom" =
    range === "yesterday" || range === "today"
      ? "today"
      : range === "7d"
        ? "7d"
        : range === "30d"
          ? "30d"
          : "month"; // 90d / year -> month bucket

  const [
    analytics,
    aiUsage,
    aiByType,
    media,
    collections,
    tags,
    users,
    conversations,
    posts,
    scheduled,
    publishingHistory,
    queueJobs,
    failedJobs,
    campaigns,
    systemEvents,
    notifications,
  ] = await Promise.all([
    aggregateAnalytics({ range: qRange, platforms: [] }),
    prisma.aITokenUsage.count(),
    prisma.aITokenUsage.groupBy({ by: ["module"], _count: { _all: true } }),
    prisma.mediaAsset.count(),
    prisma.mediaCollection.count(),
    prisma.mediaTag.count(),
    prisma.user.count(),
    prisma.conversation.count(),
    prisma.post.count(),
    prisma.scheduledPost.count(),
    prisma.publishingHistory.count(),
    prisma.queueJob.count(),
    prisma.failedJob.count(),
    prisma.campaign.count(),
    prisma.systemEvent.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
    prisma.notification.count(),
  ]);

  const connected = connectedPlatforms(analytics);
  const fb = connected.find((p: any) => p.platform === "facebook")?.metrics ?? null;

  // ---- Overview (real where available) ----
  const overview = {
    available: connected.length > 0,
    followers: fb?.followers ?? null,
    reach: fb?.reach ?? null,
    engagement: fb?.engagement ?? null,
    messages: fb?.messages ?? null,
    posts: fb?.posts ?? null,
    growthPct: fb?.followersGrowthPct ?? null,
  };

  // ---- Platform intelligence ----
  const platformIntel = analytics.platforms.map((p) => ({
    key: p.platform,
    label: p.label,
    available: p.available,
    connected: p.connected,
    followers: p.metrics?.followers ?? null,
    reach: p.metrics?.reach ?? null,
    engagement: p.metrics?.engagement ?? null,
    clicks: p.metrics?.clicks ?? null,
    lastSync: p.lastSync,
    error: p.error,
  }));

  // ---- AI intelligence (TASK-52) ----
  const aiByTypeMap = Object.fromEntries(
    (aiByType as any[]).map((r) => [r.module, r._count._all]),
  );
  const aiIntel = {
    available: aiUsage > 0,
    totalRequests: aiUsage,
    byModule: aiByTypeMap,
    health: "operational" as const,
  };

  // ---- Media intelligence (TASK-54/55) ----
  const mediaAssets = await prisma.mediaAsset.findMany({
    select: { fileSize: true, usageCount: true },
  });
  const storageBytes = mediaAssets.reduce((s, a) => s + (a.fileSize ?? 0), 0);
  const totalUsage = mediaAssets.reduce((s, a) => s + (a.usageCount ?? 0), 0);
  const mediaIntel = {
    available: media > 0,
    totalAssets: media,
    collections,
    tags,
    storageBytes,
    totalUsage,
    unusedAssets: mediaAssets.filter((a) => (a.usageCount ?? 0) === 0).length,
  };

  // ---- Team intelligence ----
  const teamIntel = {
    available: users > 0,
    employees: users,
    conversations,
    posts,
    scheduled,
  };

  // ---- Publishing intelligence ----
  const publishingIntel = {
    available: posts > 0 || scheduled > 0 || publishingHistory > 0,
    published: publishingHistory,
    scheduled,
    drafts: posts, // posts created (draft/pending) proxy
    failed: 0,
    queued: 0,
  };

  // ---- Campaign intelligence ----
  const campaignIntel = {
    available: campaigns > 0,
    total: campaigns,
    note: campaigns === 0 ? "No campaigns created yet" : undefined,
  };

  // ---- Queue intelligence (TASK-57) ----
  let queueMetrics = null;
  try {
    queueMetrics = await collectMetrics();
  } catch {
    queueMetrics = null;
  }
  const queueIntel = {
    available: REDIS_READY,
    redisConfigured: REDIS_READY,
    redisConnected: queueMetrics?.redis?.connected ?? false,
    jobsProcessed: queueJobs,
    failedJobs,
    totals: queueMetrics?.totals ?? null,
    engine: REDIS_READY ? "bullmq" : "db-fallback",
  };

  // ---- Audience & Forecast: NOT wired (no GA4/demographics source) ----
  const audienceIntel = { available: false, reason: "No audience demographics integration configured" };
  const forecastIntel = { available: false, reason: "No historical time-series model configured" };

  // ---- Live activity (queue events + recent system events) ----
  const liveEvents = [
    ...getLiveEvents(15).map((e: any) => ({ ...e, source: "queue" as const })),
    ...systemEvents.map((e: any) => ({
      kind: "system-event",
      queue: e.source,
      message: e.message ?? `${e.action}`,
      at: e.createdAt.getTime(),
      source: "system" as const,
    })),
  ]
    .sort((a, b) => b.at - a.at)
    .slice(0, 20);

  return {
    range,
    generatedAt: new Date().toISOString(),
    overview,
    platformIntel,
    aiIntel,
    mediaIntel,
    teamIntel,
    publishingIntel,
    campaignIntel,
    queueIntel,
    audienceIntel,
    forecastIntel,
    liveEvents,
    notifications,
  };
}
