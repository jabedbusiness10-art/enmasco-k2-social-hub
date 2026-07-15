import { Queue, Worker } from "bullmq";

/**
 * TASK-57 — Centralized event bus for queue observability.
 * Wraps BullMQ's global events into a lightweight emitter so the dashboard
 * Live Activity feed and monitoring can subscribe without coupling.
 */

type Listener = (event: QueueEvent) => void;

export interface QueueEvent {
  kind:
    | "job-active"
    | "job-completed"
    | "job-failed"
    | "job-stalled"
    | "job-progress"
    | "worker-online"
    | "worker-idle"
    | "redis-connected"
    | "redis-down";
  queue?: string;
  jobId?: string;
  message: string;
  at: number;
}

class EventBus {
  private listeners = new Set<Listener>();
  private buffer: QueueEvent[] = [];
  private readonly MAX = 100;

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit(event: Omit<QueueEvent, "at">) {
    const full: QueueEvent = { ...event, at: Date.now() };
    this.buffer.push(full);
    if (this.buffer.length > this.MAX) this.buffer.shift();
    for (const l of this.listeners) {
      try {
        l(full);
      } catch {
        /* listener errors are isolated */
      }
    }
  }

  recent(limit = 30): QueueEvent[] {
    return this.buffer.slice(-limit);
  }
}

export const queueEvents = new EventBus();

/** Attach BullMQ queue + worker event listeners that feed the bus. */
export function wireQueueEvents(q: Queue, queueName: string) {
  const qq = q as any;
  qq.on("completed", (job: any) =>
    queueEvents.emit({
      kind: "job-completed",
      queue: queueName,
      jobId: job.id,
      message: `Job ${job.name} completed on ${queueName}`,
    }),
  );
  qq.on("failed", (job: any, err: any) =>
    queueEvents.emit({
      kind: "job-failed",
      queue: queueName,
      jobId: job?.id,
      message: `Job ${job?.name ?? "?"} failed on ${queueName}: ${err?.message ?? "unknown"}`,
    }),
  );
  qq.on("active", (job: any) =>
    queueEvents.emit({
      kind: "job-active",
      queue: queueName,
      jobId: job.id,
      message: `Job ${job.name} started on ${queueName}`,
    }),
  );
  qq.on("stalled", (jobId: any) =>
    queueEvents.emit({
      kind: "job-stalled",
      queue: queueName,
      jobId,
      message: `Job ${jobId} stalled on ${queueName}`,
    }),
  );
}

export function wireWorkerEvents(w: Worker, queueName: string) {
  const ww = w as any;
  ww.on("active", () =>
    queueEvents.emit({ kind: "worker-online", queue: queueName, message: `Worker online: ${queueName}` }),
  );
  ww.on("idle", () =>
    queueEvents.emit({ kind: "worker-idle", queue: queueName, message: `Worker idle: ${queueName}` }),
  );
}
