import { getQueue, QUEUE_NAMES } from "./queue";
import { REDIS_READY } from "./connection";

/**
 * TASK-57 — Recurring / scheduled jobs via BullMQ repeatable jobs.
 * Registers cron-style jobs once Redis is available. Safe no-op without Redis.
 *
 * Cadences:
 *  - token:expiry-check  every 15 min (critical — refresh tokens before expiry)
 *  - analytics:meta      every 30 min
 *  - analytics:linkedin  every 30 min
 *  - cleanup:temp        daily 03:00
 *  - cleanup:logs        daily 04:00
 */

interface Repeatable {
  queue: string;
  name: string;
  payload: any;
  cron: string;
}

const REPEATABLES: Repeatable[] = [
  {
    queue: QUEUE_NAMES.SYNC,
    name: "sync:inbox",
    payload: {},
    cron: "*/15 * * * *",
  },
  {
    queue: QUEUE_NAMES.PUBLISH,
    name: "publish:retry-due",
    payload: { limit: 50 },
    cron: "* * * * *",
  },
  {
    queue: QUEUE_NAMES.TOKEN,
    name: "token:expiry-check",
    payload: { scope: "all" },
    cron: "*/15 * * * *",
  },
  {
    queue: QUEUE_NAMES.ANALYTICS,
    name: "analytics:meta",
    payload: { platform: "facebook" },
    cron: "*/30 * * * *",
  },
  {
    queue: QUEUE_NAMES.ANALYTICS,
    name: "analytics:linkedin",
    payload: { platform: "linkedin" },
    cron: "*/30 * * * *",
  },
  {
    queue: QUEUE_NAMES.CLEANUP,
    name: "cleanup:temp",
    payload: {},
    cron: "0 3 * * *",
  },
  {
    queue: QUEUE_NAMES.CLEANUP,
    name: "cleanup:logs",
    payload: {},
    cron: "0 4 * * *",
  },
];

export async function scheduleRecurringJobs(): Promise<{ scheduled: number; skipped: boolean }> {
  if (!REDIS_READY) return { scheduled: 0, skipped: true };
  let scheduled = 0;
  for (const r of REPEATABLES) {
    const q = getQueue(r.queue);
    await q.add(r.name, r.payload, {
      repeat: { pattern: r.cron, tz: "UTC" },
      jobId: `repeat:${r.queue}:${r.name}`,
      removeOnComplete: false,
    });
    scheduled++;
  }
  return { scheduled, skipped: false };
}
