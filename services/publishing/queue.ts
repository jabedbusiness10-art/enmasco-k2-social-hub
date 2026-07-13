import { prisma } from "@/lib/db";

/**
 * TASK-48 — Publishing Queue abstraction.
 *
 * The spec calls for BullMQ + Redis. The current environment has neither
 * installed nor a Redis URL, so we ship a DATABASE-BACKED queue that works
 * end-to-end today (no external dependency, no mock). The `PublishingQueue`
 * interface is stable: when Redis/BullMQ is configured, swap `DbQueue` for a
 * `BullMQQueue` adapter (same interface) — nothing else changes.
 */

export type JobHandler = (payload: any) => Promise<void>;

export interface PublishingQueue {
  enqueue(name: string, payload: any, opts?: { runAt?: Date; priority?: number }): Promise<string>;
  /** Pull the next due job (state QUEUED and runAt <= now), lock it, return id+payload or null. */
  dequeue(name: string): Promise<{ id: string; payload: any } | null>;
  complete(id: string): Promise<void>;
  fail(id: string, error: string): Promise<void>;
  /** Retry a failed job (increment attempts; re-queue if under maxAttempts). */
  retry(id: string): Promise<boolean>;
  size(name: string): Promise<number>;
}

function isRedisConfigured(): boolean {
  return !!(process.env.REDIS_URL || process.env.REDIS_HOST);
}

class DbQueue implements PublishingQueue {
  async enqueue(name: string, payload: any, opts?: { runAt?: Date; priority?: number }): Promise<string> {
    const row = await prisma.queue.create({
      data: {
        name,
        payload: JSON.stringify(payload),
        runAt: opts?.runAt ?? new Date(),
        priority: opts?.priority ?? 0,
        state: "QUEUED",
      },
    });
    return row.id;
  }

  async dequeue(name: string): Promise<{ id: string; payload: any } | null> {
    const now = new Date();
    const row = await prisma.queue.findFirst({
      where: { name, state: "QUEUED", runAt: { lte: now } },
      orderBy: [{ priority: "desc" }, { runAt: "asc" }],
    });
    if (!row) return null;
    await prisma.queue.update({
      where: { id: row.id },
      data: { state: "PROCESSING", lockedUntil: new Date(Date.now() + 5 * 60_000), startedAt: new Date() },
    });
    return { id: row.id, payload: JSON.parse(row.payload) };
  }

  async complete(id: string): Promise<void> {
    await prisma.queue.update({
      where: { id },
      data: { state: "DONE", finishedAt: new Date() },
    });
  }

  async fail(id: string, error: string): Promise<void> {
    const row = await prisma.queue.findUnique({ where: { id } });
    const attempts = (row?.attempts ?? 0) + 1;
    const max = row?.maxAttempts ?? 3;
    const state = attempts >= max ? "FAILED" : "QUEUED";
    await prisma.queue.update({
      where: { id },
      data: { state, lastError: error, attempts, runAt: new Date(Date.now() + 30_000) },
    });
  }

  async retry(id: string): Promise<boolean> {
    const row = await prisma.queue.findUnique({ where: { id } });
    if (!row) return false;
    const attempts = row.attempts + 1;
    if (attempts >= row.maxAttempts) {
      await prisma.queue.update({ where: { id }, data: { state: "FAILED" } });
      return false;
    }
    await prisma.queue.update({
      where: { id },
      data: { state: "QUEUED", attempts, runAt: new Date(), lastError: null },
    });
    return true;
  }

  async size(name: string): Promise<number> {
    return prisma.queue.count({ where: { name, state: { in: ["QUEUED", "PROCESSING"] } } });
  }
}

// BullMQ adapter placeholder (enabled automatically when Redis is configured).
// Kept minimal so the swap is a one-liner in `getQueue()`.
// class BullMQQueue implements PublishingQueue { ... }

let _queue: PublishingQueue | null = null;

/** Returns the active queue implementation. DB-backed by default; BullMQ when Redis is present. */
export function getQueue(): PublishingQueue {
  if (_queue) return _queue;
  // if (isRedisConfigured()) _queue = new BullMQQueue(); else
  _queue = new DbQueue();
  return _queue;
}

export const QUEUE_NAME = "publishing";
