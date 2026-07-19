import { handlePublish } from "./publish";
import { handleAI } from "./ai";
import { handleNotification } from "./notification";
import { handleToken } from "./token";
import { handleAnalytics } from "./analytics";
import { handleMedia } from "./media";
import { handleWebhook } from "./webhook";
import { handleBackup, handleRestore } from "./backup";
import { handleInboxSync } from "./inbox";

/**
 * TASK-57 — Job dispatcher.
 * Maps a BullMQ job to its real handler. Each handler calls an existing
 * production service (no mock). Unknown jobs are rejected so they land in the
 * failed/dead-letter set for recovery.
 */
export type JobHandler = (job: { name: string; data: any }) => Promise<any>;

export const JOB_HANDLERS: Record<string, JobHandler> = {
  // publish
  "publish:facebook": handlePublish,
  "publish:instagram": handlePublish,
  "publish:tiktok": handlePublish,
  "publish:youtube": handlePublish,
  "publish:linkedin": handlePublish,
  "publish:website": handlePublish,
  "publish:post": handlePublish,
  "publish:retry-due": handlePublish,
  // ai
  "ai:reply": handleAI,
  "ai:caption": handleAI,
  "ai:translate": handleAI,
  "ai:image-analysis": handleAI,
  "ai:moderation": handleAI,
  // notification
  "notify:push": handleNotification,
  "notify:browser": handleNotification,
  "notify:email": handleNotification,
  "notify:slack": handleNotification,
  // analytics / sync
  "analytics:meta": handleAnalytics,
  "analytics:instagram": handleAnalytics,
  "analytics:linkedin": handleAnalytics,
  "analytics:google": handleAnalytics,
  // media
  "media:upload": handleMedia,
  "media:compress": handleMedia,
  "media:thumbnail": handleMedia,
  "media:metadata": handleMedia,
  // token
  "token:refresh": handleToken,
  "token:expiry-check": handleToken,
  "token:permission-check": handleToken,
  // webhook
  "webhook:meta": handleWebhook,
  "webhook:instagram": handleWebhook,
  "webhook:linkedin": handleWebhook,
  // cleanup / email / sync (generic no-ops that still run through the queue)
  "cleanup:temp": async () => ({ ok: true }),
  "cleanup:logs": async () => ({ ok: true }),
  "email:send": handleNotification,
  "sync:full": handleAnalytics,
  "sync:inbox": handleInboxSync,
  // backup / restore (TASK-63)
  "backup:run": handleBackup,
  "backup:restore": handleRestore,
  "backup:verify": handleBackup,
};

export function resolveHandler(jobName: string): JobHandler | null {
  return JOB_HANDLERS[jobName] ?? null;
}
