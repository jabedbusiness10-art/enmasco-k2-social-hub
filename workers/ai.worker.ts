import { spawnWorker } from "@/lib/queue/workers";

// TASK-57 — ai worker. Registers a BullMQ worker on the "ai" queue.
// Real job processing is dispatched via jobs/index.ts (real service handlers).
spawnWorker("ai");
