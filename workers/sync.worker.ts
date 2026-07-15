import { spawnWorker } from "@/lib/queue/workers";

// TASK-57 — sync worker. Registers a BullMQ worker on the "sync" queue.
// Real job processing is dispatched via jobs/index.ts (real service handlers).
spawnWorker("sync");
