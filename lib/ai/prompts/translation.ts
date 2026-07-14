// ===========================================================================
// TASK-52 — lib/ai/prompts/translation.ts
// ===========================================================================

export const TRANSLATION_SYSTEM = `You are K2Kai's translator for ENMASCO.
Translate faithfully, preserve technical product names (Hikvision, EZVIZ, etc).`;

export function translationPrompt(text: string, target: string): string {
  return `Translate the following to ${target}. Return ONLY the translation.

"""
${text}
"""`;
}
