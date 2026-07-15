import { registerWorker } from "@/lib/queue/queue";
import { resolveHandler } from "@/jobs";
import { prisma } from "@/lib/db";
import { REDIS_READY } from "@/lib/queue/connection";
import { queueEvents } from "@/lib/queue/events";
import { JOB_TYPES } from "@/lib/queue/queue";

/**
 * TASK-57 — Worker bootstrap + shared worker runtime.
 * Each domain worker file calls spawnWorker(); all share the same dispatch
 * logic that routes a BullMQ job to its real handler (jobs/index.ts) and
 * audits success/failure into the Prisma QueueJob/FailedJob tables.
 */

const CONCURRENCY: Record<string, number> = {
  publish: 4,
  ai: 8,
  notification: 6,
  analytics: 2,
  media: 4,
  token: 2,
  webhook: 4,
  cleanup: 2,
  email: 2,
  sync: 2,
};

let workerSeq = 0;

export function spawnWorker(queueName: string) {
  if (!REDIS_READY) return null;
  const concurrency = CONCURRENCY[queueName] ?? 4;
  const workerName = `${queueName}-worker-${++workerSeq}`;
  return registerWorker(queueName, concurrency, async (job) => {
    const handler = resolveHandler(job.name);
    const started = Date.now();
    // Audit: create a QueueJob audit row.
    const audit = await prisma.queueJob
      .create({
        data: {
          queue: queueName,
          name: job.name,
          jobId: String(job.id),
          payload: JSON.stringify(job.data ?? {}),
          status: "ACTIVE",
          priority: job.opts?.priority ?? 0,
          maxAttempts: job.opts?.attempts ?? 3,
          startedAt: new Date(),
        },
      })
      .catch(() => null);

    if (!handler) {
      const err = new Error(`No handler for job ${job.name}`);
      await failAudit(audit?.id, err.message);
      throw err;
    }

    try {
      const result = await handler({ name: job.name, data: job.data });
      await prisma.queueJob
        .update({
          where: { id: audit!.id },
          data: {
            status: "COMPLETED",
            finishedAt: new Date(),
            processingMs: Date.now() - started,
            result: JSON.stringify(result ?? {}).slice(0, 2000),
            attempts: (job.attemptsMade ?? 0) + 1,
          },
        })
        .catch(() => {});
      queueEvents.emit({
        kind: "job-completed",
        queue: queueName,
        jobId: String(job.id),
        message: `${job.name} completed on ${queueName}`,
      });
      return result;
    } catch (e: any) {
      await failAudit(audit?.id, e?.message ?? "unknown", (job.attemptsMade ?? 0) + 1);
      throw e;
    }
  });
}

async function failAudit(auditId: string | undefined, error: string, attempts = 1) {
  if (!auditId) return;
  await prisma.queueJob
    .update({ where: { id: auditId }, data: { status: "FAILED", lastError: error, attempts } })
    .catch(() => {});
  await prisma.failedJob
    .create({
      data: { queue: "?", name: "?", jobId: auditId, error, attempts, payload: null },
    })
    .catch(() => {});
}

/** Boot every domain worker. Idempotent; safe without Redis. */
export function bootWorkers(): { booted: boolean } {
  if (!REDIS_READY) return { booted: false };
  // Spawn one worker per queue defined in JOB_TYPES values.
  const queues = Array.from(new Set(Object.values(JOB_TYPES)));
  for (const q of queues) spawnWorker(q);
  return { booted: true };
}
