import { getQueue, QUEUE_NAME } from "@/services/publishing/queue";
import { executePublish } from "@/services/publishing/service";

/**
 * TASK-48 — Publishing worker.
 * Drains the DB-backed queue: for each due job, executes the real publish and
 * marks the queue row done/failed. When BullMQ is configured, the same
 * `executePublish` runs inside a BullMQ processor instead — interface-identical.
 */

let running = false;

export async function processDueJobs(): Promise<{ processed: number; errors: number }> {
  if (running) return { processed: 0, errors: 0 }; // avoid overlapping loops
  running = true;
  const queue = getQueue();
  let processed = 0;
  let errors = 0;
  try {
    for (let i = 0; i < 20; i++) {
      const job = await queue.dequeue(QUEUE_NAME);
      if (!job) break;
      try {
        const { postId } = job.payload;
        await executePublish(postId);
        await queue.complete(job.id);
        processed++;
      } catch (e: any) {
        errors++;
        await queue.fail(job.id, e?.message ?? "Worker execution failed");
      }
    }
  } finally {
    running = false;
  }
  return { processed, errors };
}

/** Start a background poller (called once at server boot). */
export function startPublishingWorker(intervalMs = 10_000): void {
  if (typeof setInterval === "undefined") return;
  setInterval(() => {
    processDueJobs().catch(() => {});
  }, intervalMs);
}
