import { spawnWorker } from "@/lib/queue/workers";

// TASK-57 — notification worker. Registers a BullMQ worker on the "notification" queue.
// Real job processing is dispatched via jobs/index.ts (real service handlers).
spawnWorker("notification");
