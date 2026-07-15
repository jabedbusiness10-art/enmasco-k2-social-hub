import { notificationService } from "@/services/notification/notificationService";

/**
 * TASK-57 — Notification job handlers.
 * Pushes real notifications via the centralized NotificationService.
 */
export async function handleNotification(job: { name: string; data: any }): Promise<any> {
  const { userId, type, priority, title, body, entity, entityType, platform } = job.data ?? {};
  if (!userId || !title) throw new Error("notification job missing userId/title");
  await notificationService.notify({
    userId,
    type: type ?? "SYSTEM",
    priority: priority ?? "MEDIUM",
    title,
    body: body ?? "",
    entity,
    entityType,
    platform,
  });
  return { ok: true };
}
