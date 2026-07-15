import { spawnWorker } from "@/lib/queue/workers";

// TASK-57 — email worker. Registers a BullMQ worker on the "email" queue.
// Real job processing is dispatched via jobs/index.ts (real service handlers).
spawnWorker("email");
