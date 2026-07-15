import { spawnWorker } from "@/lib/queue/workers";

// TASK-57 — token worker. Registers a BullMQ worker on the "token" queue.
// Real job processing is dispatched via jobs/index.ts (real service handlers).
spawnWorker("token");
