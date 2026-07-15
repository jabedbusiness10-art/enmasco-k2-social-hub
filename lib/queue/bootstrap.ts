import { bootQueueEngine } from "./queue";
import { bootWorkers } from "./workers";
import { scheduleRecurringJobs } from "./scheduler";
import { REDIS_READY } from "./connection";

/**
 * TASK-57 — Idempotent engine bootstrap.
 * Called once per server process (guarded by a global flag). Safe when Redis
 * is absent — the engine simply reports unavailable and the DB queue is used.
 */
let booted = false;

export async function ensureQueueEngine(): Promise<{ ready: boolean; reason?: string }> {
  if (booted) return { ready: REDIS_READY };
  booted = true;
  if (!REDIS_READY) {
    return { ready: false, reason: "Redis not configured (REDIS_URL missing)" };
  }
  const engine = bootQueueEngine();
  if (!engine.ready) return engine;
  bootWorkers();
  // Schedule repeatable jobs (best-effort; idempotent by jobId).
  scheduleRecurringJobs().catch(() => {});
  return { ready: true };
}
