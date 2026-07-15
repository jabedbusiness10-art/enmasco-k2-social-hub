import { prisma } from "@/lib/db";
import { getAllQueueStats, QueueStats } from "./queue";
import { REDIS_READY, pingRedis } from "./connection";

/**
 * TASK-57 — Queue metrics.
 * Aggregates live BullMQ counts + persists periodic snapshots into QueueMetric
 * for trend analysis. When Redis is absent, reports unavailable (no fake data).
 */

export interface EngineMetrics {
  redis: {
    configured: boolean;
    connected: boolean;
  };
  queues: QueueStats[];
  totals: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  };
  generatedAt: string;
}

export async function collectMetrics(): Promise<EngineMetrics | null> {
  if (!REDIS_READY) return null;
  let connected = false;
  try {
    connected = await pingRedis();
  } catch {
    connected = false;
  }
  if (!connected) {
    return {
      redis: { configured: true, connected: false },
      queues: [],
      totals: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
      generatedAt: new Date().toISOString(),
    };
  }

  const queues = await getAllQueueStats();
  const totals = queues.reduce(
    (acc, q) => {
      acc.waiting += q.waiting;
      acc.active += q.active;
      acc.completed += q.completed;
      acc.failed += q.failed;
      acc.delayed += q.delayed;
      return acc;
    },
    { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
  );

  return {
    redis: { configured: true, connected: true },
    queues,
    totals,
    generatedAt: new Date().toISOString(),
  };
}

/** Persist a snapshot of current metrics into QueueMetric for trend history. */
export async function snapshotMetrics(): Promise<void> {
  const m = await collectMetrics();
  if (!m || !m.redis.connected) return;
  const rows = m.queues.flatMap((q) => [
    { queue: q.name, metric: "waiting", value: q.waiting },
    { queue: q.name, metric: "active", value: q.active },
    { queue: q.name, metric: "completed", value: q.completed },
    { queue: q.name, metric: "failed", value: q.failed },
    { queue: q.name, metric: "delayed", value: q.delayed },
  ]);
  if (!rows.length) return;
  await prisma.queueMetric.createMany({ data: rows }).catch(() => {});
}

/** Rolling 24h trend for a queue+metric (for sparklines). */
export async function trend(queue: string, metric: string, hours = 24): Promise<number[]> {
  const since = new Date(Date.now() - hours * 3600_000);
  const rows = await prisma.queueMetric.findMany({
    where: { queue, metric, timestamp: { gte: since } },
    orderBy: { timestamp: "asc" },
    select: { value: true },
  });
  return rows.map((r) => r.value);
}
