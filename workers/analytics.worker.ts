import { spawnWorker } from "@/lib/queue/workers";

// TASK-57 — analytics worker. Registers a BullMQ worker on the "analytics" queue.
// Real job processing is dispatched via jobs/index.ts (real service handlers).
spawnWorker("analytics");
