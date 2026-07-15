import { aggregateAnalytics, connectedPlatforms } from "@/lib/analytics/aggregator";

/**
 * TASK-57 — Analytics & sync job handlers.
 * Triggers the real TASK-51 aggregator for a platform (Meta/LinkedIn).
 * Persists a SystemEvent so the Live Activity feed reflects the sync.
 */
export async function handleAnalytics(job: { name: string; data: any }): Promise<any> {
  const platform = job.data?.platform ?? "facebook";
  const result = await aggregateAnalytics({ range: "7d", platforms: [platform as any] });
  const connected = connectedPlatforms(result);
  // Mirror into the activity stream.
  try {
    const { prisma } = await import("@/lib/db");
    await prisma.systemEvent.create({
      data: {
        source: "queue",
        action: "analytics-sync",
        status: "success",
        message: `Analytics synced for ${platform} (${connected.length} source(s))`,
        meta: JSON.stringify({ platform, connected: connected.length }),
      },
    });
  } catch {}
  return { platform, connected: connected.length };
}
