// ===========================================================================
// TASK-52 — lib/ai/prompts/summary.ts
// ===========================================================================

export const SUMMARY_SYSTEM = `You are K2Kai's conversation summarizer for ENMASCO
enterprise support. Produce a tight internal handoff summary.`;

export function summaryPrompt(messages: string): string {
  return `Summarize this thread. Extract: intent, products mentioned, sentiment, pending action.

"""
${messages}
"""`;
}
