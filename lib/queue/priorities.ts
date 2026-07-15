/**
 * TASK-57 — Job priorities.
 * BullMQ priority: lower number = higher priority (1 = highest).
 */

export enum Priority {
  CRITICAL = 1,
  HIGH = 5,
  NORMAL = 10,
  LOW = 15,
  BACKGROUND = 20,
}

export const PriorityLabel: Record<Priority, string> = {
  [Priority.CRITICAL]: "Critical",
  [Priority.HIGH]: "High",
  [Priority.NORMAL]: "Normal",
  [Priority.LOW]: "Low",
  [Priority.BACKGROUND]: "Background",
};

/** Map a logical queue/purpose to its enterprise priority. */
export function priorityFor(name: string): number {
  const n = name.toLowerCase();
  if (n.includes("oauth") || n.includes("token") || n.includes("webhook")) return Priority.CRITICAL;
  if (n.includes("publish") || n.includes("reply") || n.includes("notification"))
    return Priority.HIGH;
  if (n.includes("analytics") || n.includes("sync") || n.includes("media")) return Priority.NORMAL;
  if (n.includes("thumbnail") || n.includes("compress")) return Priority.LOW;
  if (n.includes("cleanup") || n.includes("archive") || n.includes("log")) return Priority.BACKGROUND;
  return Priority.NORMAL;
}
