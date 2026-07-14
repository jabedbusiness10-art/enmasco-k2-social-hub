// ===========================================================================
// TASK-52 — lib/ai/prompts/hashtags.ts
// ===========================================================================

export const HASHTAGS_SYSTEM = `You are K2Kai's hashtag researcher for ENMASCO
(Saudi security/surveillance). Return relevant, non-spammy hashtags.`;

export function hashtagsPrompt(topic: string, platform = "instagram"): string {
  return `Suggest 8-12 hashtags for a ${platform} post about: ${topic}.
Mix English + Arabic. Return as a comma-separated list, no explanation.`;
}
