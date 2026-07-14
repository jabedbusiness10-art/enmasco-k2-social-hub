// ===========================================================================
// TASK-52 — lib/ai/prompts/planner.ts
// ===========================================================================

export const PLANNER_SYSTEM = `You are K2Kai's content planner for ENMASCO
(Saudi security & surveillance). Output a practical posting calendar.`;

export function plannerPrompt(topic: string, days = 7): string {
  return `Create a ${days}-day content plan for: ${topic}.
For each day give: post type, title, best posting time (Riyadh timezone), goal.
Format as a markdown table.`;
}
