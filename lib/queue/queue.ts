import { Queue, Worker } from "bullmq";
import { getRedisConnection, REDIS_READY } from "./connection";
import { wireQueueEvents, wireWorkerEvents, queueEvents } from "./events";
import { bullmqBackoff, DEFAULT_RETRY } from "./retry";
import { priorityFor } from "./priorities";

/**
 * TASK-57 — Central Queue Engine.
 *
 * Defines the enterprise queue topology and owns the lifecycle of every BullMQ
 * Queue + Worker. When Redis is NOT available (REDIS_READY === false), the
 * engine reports unavailable and the platform falls back to its DB-backed
 * queue — never faking data (TASK-51 rule).
 */

export const QUEUE_NAMES = {
  AI: "ai",
  PUBLISH: "publish",
  NOTIFICATION: "notification",
  ANALYTICS: "analytics",
  MEDIA: "media",
  TOKEN: "token",
  WEBHOOK: "webhook",
  CLEANUP: "cleanup",
  EMAIL: "email",
  SYNC: "sync",
  BACKUP: "backup",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

// Logical sub-job names per queue (used by workers to dispatch to real handlers).
export const JOB_TYPES = {
  "ai:reply": `${QUEUE_NAMES.AI}`,
  "ai:caption": `${QUEUE_NAMES.AI}`,
  "ai:translate": `${QUEUE_NAMES.AI}`,
  "ai:image-analysis": `${QUEUE_NAMES.AI}`,
  "ai:moderation": `${QUEUE_NAMES.AI}`,
  "publish:facebook": `${QUEUE_NAMES.PUBLISH}`,
  "publish:instagram": `${QUEUE_NAMES.PUBLISH}`,
  "publish:linkedin": `${QUEUE_NAMES.PUBLISH}`,
  "publish:website": `${QUEUE_NAMES.PUBLISH}`,
  "notify:push": `${QUEUE_NAMES.NOTIFICATION}`,
  "notify:browser": `${QUEUE_NAMES.NOTIFICATION}`,
  "notify:email": `${QUEUE_NAMES.NOTIFICATION}`,
  "analytics:meta": `${QUEUE_NAMES.ANALYTICS}`,
  "analytics:instagram": `${QUEUE_NAMES.ANALYTICS}`,
  "analytics:linkedin": `${QUEUE_NAMES.ANALYTICS}`,
  "analytics:google": `${QUEUE_NAMES.ANALYTICS}`,
  "media:upload": `${QUEUE_NAMES.MEDIA}`,
  "media:compress": `${QUEUE_NAMES.MEDIA}`,
  "media:thumbnail": `${QUEUE_NAMES.MEDIA}`,
  "token:refresh": `${QUEUE_NAMES.TOKEN}`,
  "token:expiry-check": `${QUEUE_NAMES.TOKEN}`,
  "webhook:meta": `${QUEUE_NAMES.WEBHOOK}`,
  "webhook:instagram": `${QUEUE_NAMES.WEBHOOK}`,
  "cleanup:temp": `${QUEUE_NAMES.CLEANUP}`,
  "cleanup:logs": `${QUEUE_NAMES.CLEANUP}`,
  "backup:run": `${QUEUE_NAMES.BACKUP}`,
  "backup:restore": `${QUEUE_NAMES.BACKUP}`,
  "backup:verify": `${QUEUE_NAMES.BACKUP}`,
} as const;

const connection = () => getRedisConnection();

const queues = new Map<string, Queue>();
const workers = new Map<string, Worker>();
let booted = false;

export function isQueueEngineReady(): boolean {
  return REDIS_READY;
}

function defaultJobOptions() {
  return {
    attempts: DEFAULT_RETRY.attempts,
    backoff: bullmqBackoff(DEFAULT_RETRY),
    removeOnComplete: { age: 24 * 3600, count: 1000 },
    removeOnFail: { age: 7 * 24 * 3600, count: 5000 },
    // Dead-letter style: keep failed jobs for recovery.
  };
}

/** Create (or return cached) a BullMQ Queue. */
export function getQueue(name: string): Queue {
  if (!REDIS_READY) throw new Error("Queue engine unavailable: Redis not configured");
  let q = queues.get(name);
  if (!q) {
    q = new Queue(name, { connection: connection() as any, defaultJobOptions: defaultJobOptions() });
    wireQueueEvents(q, name);
    queues.set(name, q);
  }
  return q;
}

/** Register a worker for a queue. Handler returns a Promise<void>. */
export function registerWorker(name: string, concurrency: number, handler: (job: any) => Promise<any>) {
  if (!REDIS_READY) return null;
  if (workers.has(name)) return workers.get(name)!;
  const w = new Worker(
    name,
    async (job) => {
      queueEvents.emit({
        kind: "job-active",
        queue: name,
        jobId: job.id,
        message: `Processing ${job.name} on ${name}`,
      });
      const result = await handler(job);
      return result;
    },
    {
      connection: connection() as any,
      concurrency,
      autorun: true,
    },
  );
  wireWorkerEvents(w, name);
  workers.set(name, w);
  return w;
}

/** Enqueue a job with enterprise defaults. */
export async function enqueue(
  queueName: string,
  jobName: string,
  payload: any,
  opts: { priority?: number; delay?: number; jobId?: string } = {},
) {
  if (!REDIS_READY) throw new Error("Queue engine unavailable: Redis not configured");
  const q = getQueue(queueName);
  const priority = opts.priority ?? priorityFor(jobName);
  const job = await q.add(jobName, payload, {
    priority,
    delay: opts.delay ?? 0,
    jobId: opts.jobId,
    attempts: DEFAULT_RETRY.attempts,
    backoff: bullmqBackoff(DEFAULT_RETRY),
  });
  queueEvents.emit({
    kind: "job-active",
    queue: queueName,
    jobId: job.id,
    message: `Enqueued ${jobName} on ${queueName}`,
  });
  return job;
}

export async function pauseQueue(name: string): Promise<void> {
  const q = getQueue(name);
  await q.pause();
}

export async function resumeQueue(name: string): Promise<void> {
  const q = getQueue(name);
  await q.resume();
}

export interface QueueStats {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
}

export async function getQueueStats(name: string): Promise<QueueStats> {
  const q = getQueue(name);
  const [waiting, active, completed, failed, delayed, isPaused] = await Promise.all([
    q.getWaitingCount(),
    q.getActiveCount(),
    q.getCompletedCount(),
    q.getFailedCount(),
    q.getDelayedCount(),
    q.isPaused(),
  ]);
  return { name, waiting, active, completed, failed, delayed, paused: isPaused };
}

export async function getAllQueueStats(): Promise<QueueStats[]> {
  const names = Object.values(QUEUE_NAMES);
  return Promise.all(names.map((n) => getQueueStats(n).catch(() => null))).then((r) =>
    r.filter(Boolean) as QueueStats[],
  );
}

export function getLiveEvents(limit = 30) {
  return queueEvents.recent(limit);
}

/** Boot all queues + workers. Idempotent. Safe to call when Redis absent. */
export function bootQueueEngine(): { ready: boolean; reason?: string } {
  if (booted) return { ready: REDIS_READY };
  if (!REDIS_READY) {
    return { ready: false, reason: "Redis not configured (REDIS_URL missing)" };
  }
  // Workers are registered by each domain worker module via registerWorker().
  // Importing the worker modules triggers registration (side-effect).
  // (See workers/*.ts and lib/queue/workers.ts bootstrap.)
  booted = true;
  queueEvents.emit({ kind: "redis-connected", message: "Queue engine booted (Redis connected)" });
  return { ready: true };
}

export async function shutdownQueueEngine(): Promise<void> {
  for (const w of workers.values()) await w.close().catch(() => {});
  for (const q of queues.values()) await q.close().catch(() => {});
  workers.clear();
  queues.clear();
  booted = false;
}
