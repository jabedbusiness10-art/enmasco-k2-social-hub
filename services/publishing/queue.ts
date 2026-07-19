import { prisma } from "@/lib/db";
import { enqueue as bullEnqueue, getQueue as bullGetQueue, QUEUE_NAMES } from "@/lib/queue/queue";
import { REDIS_READY } from "@/lib/queue/connection";

/**
 * TASK-57 — Publishing Queue.
 *
 * Previously a DB-backed-only queue (TASK-48). Now it delegates to the central
 * BullMQ engine (lib/queue) when Redis is configured, and falls back to the
 * DB-backed implementation otherwise. The `PublishingQueue` interface is kept
 * stable so services/publishing/service.ts (enqueuePublish) is unchanged.
 */

export type JobHandler = (payload: any) => Promise<void>;

export interface PublishingQueue {
  enqueue(name: string, payload: any, opts?: { runAt?: Date; priority?: number }): Promise<string>;
  dequeue(name: string): Promise<{ id: string; payload: any } | null>;
  complete(id: string): Promise<void>;
  fail(id: string, error: string): Promise<void>;
  retry(id: string): Promise<boolean>;
  size(name: string): Promise<number>;
}

export const QUEUE_NAME = QUEUE_NAMES.PUBLISH;

// ---------------------------------------------------------------------------
// DB-backed fallback (used when Redis is absent)
// ---------------------------------------------------------------------------
class DbQueue implements PublishingQueue {
  async enqueue(name: string, payload: any, opts?: { runAt?: Date; priority?: number }): Promise<string> {
    const row = await prisma.queue.create({
      data: {
        name: QUEUE_NAME,
        payload: JSON.stringify({ ...payload, __jobName: name }),
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
    await prisma.queue.update({ where: { id }, data: { state: "DONE", finishedAt: new Date() } });
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

// ---------------------------------------------------------------------------
// BullMQ-backed implementation (used when Redis is configured)
// ---------------------------------------------------------------------------
class BullMQPubQueue implements PublishingQueue {
  async enqueue(name: string, payload: any, opts?: { runAt?: Date; priority?: number }): Promise<string> {
    const delay = opts?.runAt ? Math.max(0, opts.runAt.getTime() - Date.now()) : 0;
    const job = await bullEnqueue(QUEUE_NAME, name, payload, { priority: opts?.priority, delay });
    return job.id ?? "";
  }
  // dequeue/complete/fail/retry are managed by the BullMQ worker; these are no-ops
  // for the publish-by-postId flow (the worker calls executePublish directly).
  async dequeue(): Promise<{ id: string; payload: any } | null> {
    return null;
  }
  async complete(): Promise<void> {}
  async fail(): Promise<void> {}
  async retry(): Promise<boolean> {
    return false;
  }
  async size(): Promise<number> {
    try {
      const q = bullGetQueue(QUEUE_NAME);
      return (await q.getWaitingCount()) + (await q.getActiveCount());
    } catch {
      return 0;
    }
  }
}

let _queue: PublishingQueue | null = null;

export function getQueue(): PublishingQueue {
  if (_queue) return _queue;
  _queue = REDIS_READY ? new BullMQPubQueue() : new DbQueue();
  return _queue;
}

export { REDIS_READY };
