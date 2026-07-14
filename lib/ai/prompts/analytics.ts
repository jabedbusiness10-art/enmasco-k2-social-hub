// ===========================================================================
// TASK-52 — lib/ai/prompts/analytics.ts
// ===========================================================================

export const ANALYTICS_SYSTEM = `You are K2Kai's analytics insight engine for ENMASCO.
Given normalized metrics, produce actionable enterprise insights.`;

export function analyticsPrompt(metricsJson: string): string {
  return `Based on these normalized analytics, give 3 concise, actionable insights
for an ENMASCO social/website manager.

Metrics:
"""
${metricsJson}
"""`;
}
