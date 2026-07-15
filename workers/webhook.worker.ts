import { spawnWorker } from "@/lib/queue/workers";

// TASK-57 — webhook worker. Registers a BullMQ worker on the "webhook" queue.
// Real job processing is dispatched via jobs/index.ts (real service handlers).
spawnWorker("webhook");
