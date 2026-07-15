import { spawnWorker } from "@/lib/queue/workers";

// TASK-57 — cleanup worker. Registers a BullMQ worker on the "cleanup" queue.
// Real job processing is dispatched via jobs/index.ts (real service handlers).
spawnWorker("cleanup");
