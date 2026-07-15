// TASK-59.3 — Standalone BullMQ Worker process.
// Runs in its OWN container (docker-compose `worker` service) so background
// job processing scales independently of the web tier.
//
// Boot order (must match lib/queue/bootstrap.ts):
//   1. import worker modules  -> registers handlers via registerWorker()
//   2. bootQueueEngine()      -> creates Queue/Worker singletons
//   3. bootWorkers()          -> spawns the worker processes
//
// Uses tsx (TS-aware) so it can run .ts directly in Docker.

import "dotenv/config";

import { log } from "@/lib/logger";
import { bootQueueEngine } from "@/lib/queue/queue";
import { bootWorkers } from "@/lib/queue/workers";

// Side-effect imports: each registers its domain worker.
import "@/workers/ai.worker";
import "@/workers/publish.worker";
import "@/workers/notification.worker";
import "@/workers/token.worker";
import "@/workers/sync.worker";
import "@/workers/media.worker";
import "@/workers/webhook.worker";
import "@/workers/cleanup.worker";
import "@/workers/analytics.worker";
import "@/workers/email.worker";

const l = log("worker");
const engine = bootQueueEngine();
if (!engine.ready) {
  l.warn("queue engine not ready — running idle (DB fallback in web tier).", engine.reason);
  // Keep the container alive so it can pick up Redis if it appears later.
} else {
  const res = bootWorkers();
  l.info("BullMQ workers booted", res);
}

// Graceful shutdown.
for (const sig of ["SIGTERM", "SIGINT"] as const) {
  process.on(sig, () => {
    l.info(`received ${sig}, shutting down workers`);
    process.exit(0);
  });
}
