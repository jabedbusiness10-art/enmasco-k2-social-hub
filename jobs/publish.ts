import { executePublish, processDuePublishingRetries } from "@/services/publishing/service";

/**
 * TASK-57 — Publish job handlers.
 * Dispatches to the REAL publishing engine (services/publishing/service.ts).
 * No mock: every call hits the live platform Graph / REST API.
 */
export async function handlePublish(job: { name: string; data: any }): Promise<any> {
  if (job.name === "publish:retry-due") return processDuePublishingRetries(job.data?.limit);
  const { postId } = job.data;
  if (!postId) throw new Error("publish job missing postId");
  return executePublish(postId);
}
