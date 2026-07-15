import { prisma } from "@/lib/db";
import { getLiveEvents } from "@/lib/queue/queue";

export interface ActivityItem {
  id: string;
  type: string; // facebook.connected, ai.reply, media.uploaded, queue.completed, etc.
  module: string; // executive module it belongs to
  title: string;
  detail?: string;
  at: number;
  source: "system" | "notification" | "queue" | "publishing" | "media" | "ai";
}

/**
 * TASK-58.5 — Global Enterprise Activity Feed.
 * Aggregates REAL recent events from every module into one timeline.
 * No fake data: only rows that actually exist are returned.
 */
export async function getActivityFeed(limit = 40): Promise<ActivityItem[]> {
  const [systemEvents, notifications, publishing, media, ai] = await Promise.all([
    prisma.systemEvent.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 15, select: { id: true, title: true, body: true, type: true, module: true, createdAt: true } }),
    prisma.publishingHistory.findMany({ orderBy: { publishedAt: "desc" }, take: 10 }),
    prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 10, select: { id: true, originalName: true, createdAt: true, status: true } }),
    prisma.aITokenUsage.findMany({ orderBy: { createdAt: "desc" }, take: 10, select: { id: true, module: true, createdAt: true } }),
  ]);

  const items: ActivityItem[] = [];

  for (const e of systemEvents) {
    items.push({
      id: `sys-${e.id}`,
      type: `${e.source}.${e.action}`,
      module: e.source,
      title: e.message ?? `${e.action}`,
      at: e.createdAt.getTime(),
      source: "system",
    });
  }
  for (const n of notifications) {
    items.push({
      id: `notif-${n.id}`,
      type: `notification.${n.type}`,
      module: n.module ?? "notification",
      title: n.title,
      detail: n.body ?? undefined,
      at: n.createdAt.getTime(),
      source: "notification",
    });
  }
  for (const p of publishing) {
    items.push({
      id: `pub-${p.id}`,
      type: "publishing.completed",
      module: "publishing",
      title: `Post published to ${p.platform}`,
      detail: p.status,
      at: p.publishedAt?.getTime() ?? p.createdAt.getTime(),
      source: "publishing",
    });
  }
  for (const m of media) {
    items.push({
      id: `media-${m.id}`,
      type: "media.uploaded",
      module: "media",
      title: `Media uploaded: ${m.originalName ?? m.id}`,
      detail: m.status,
      at: m.createdAt.getTime(),
      source: "media",
    });
  }
  for (const a of ai) {
    items.push({
      id: `ai-${a.id}`,
      type: "ai.request",
      module: "ai",
      title: `AI request (${a.module})`,
      at: a.createdAt.getTime(),
      source: "ai",
    });
  }

  // Live queue events (in-memory, only when Redis active)
  for (const e of getLiveEvents(10)) {
    items.push({
      id: `q-${e.at}-${e.kind}`,
      type: `queue.${e.kind}`,
      module: e.queue ?? "queue",
      title: e.message,
      at: e.at,
      source: "queue",
    });
  }

  return items.sort((a, b) => b.at - a.at).slice(0, limit);
}
