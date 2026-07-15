import { executePublish } from "@/services/publishing/service";

/**
 * TASK-57 — Publish job handlers.
 * Dispatches to the REAL publishing engine (services/publishing/service.ts).
 * No mock: every call hits the live platform Graph / REST API.
 */
export async function handlePublish(job: { name: string; data: any }): Promise<any> {
  const { postId } = job.data;
  if (!postId) throw new Error("publish job missing postId");
  return executePublish(postId);
}
