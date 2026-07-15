import { spawnWorker } from "@/lib/queue/workers";

// TASK-57 — media worker. Registers a BullMQ worker on the "media" queue.
// Real job processing is dispatched via jobs/index.ts (real service handlers).
spawnWorker("media");
