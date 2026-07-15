import { notificationService, NotifyInput } from "@/services/notification/notificationService";

/**
 * Central publish helper. Every module calls notify(...) so there is a single
 * notification engine. Returns void (fire-and-forget) to avoid blocking callers.
 */
export async function notify(input: NotifyInput): Promise<void> {
  try {
    await notificationService.notify(input);
  } catch (e) {
    // notifications must never break the calling module
    console.error("[notify] failed", e);
  }
}

// Typed shortcuts for common modules
export const notifySocial = (i: Omit<NotifyInput, "module">) => notify({ ...i, module: "social" });
export const notifyPublish = (i: Omit<NotifyInput, "module">) => notify({ ...i, module: "publishing" });
export const notifyAI = (i: Omit<NotifyInput, "module">) => notify({ ...i, module: "ai" });
export const notifyMedia = (i: Omit<NotifyInput, "module">) => notify({ ...i, module: "media" });
export const notifyTeam = (i: Omit<NotifyInput, "module">) => notify({ ...i, module: "team" });
export const notifyAnalytics = (i: Omit<NotifyInput, "module">) => notify({ ...i, module: "analytics" });
export const notifySecurity = (i: Omit<NotifyInput, "module">) => notify({ ...i, module: "auth" });
export const notifySystem = (i: Omit<NotifyInput, "module">) => notify({ ...i, module: "system" });
