// TASK-59.3 — Standalone BullMQ Scheduler process.
// Runs in its OWN container (docker-compose `scheduler` service) so repeatable
// jobs (token refresh, analytics sync, cleanup) are scheduled exactly once,
// independent of web/worker scaling.
//
// Uses tsx so it can run .ts directly in Docker.

import "dotenv/config";

import { log } from "@/lib/logger";
import { bootQueueEngine } from "@/lib/queue/queue";
import { scheduleRecurringJobs } from "@/lib/queue/scheduler";

const l = log("scheduler");
const engine = bootQueueEngine();
if (!engine.ready) {
  l.warn("queue engine not ready — scheduler idle (Redis absent).", engine.reason);
} else {
  scheduleRecurringJobs()
    .then((r) => l.info("recurring jobs scheduled", r))
    .catch((e) => l.error("scheduler failed", e instanceof Error ? e.message : e));
}

for (const sig of ["SIGTERM", "SIGINT"] as const) {
  process.on(sig, () => {
    l.info(`received ${sig}, stopping scheduler`);
    process.exit(0);
  });
}
