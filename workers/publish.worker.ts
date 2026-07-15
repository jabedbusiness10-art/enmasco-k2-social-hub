import { spawnWorker } from "@/lib/queue/workers";

// TASK-57 — publish worker. Registers a BullMQ worker on the "publish" queue.
// Real job processing is dispatched via jobs/index.ts (real service handlers).
spawnWorker("publish");
