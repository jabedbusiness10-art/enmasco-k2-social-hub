// ===========================================================================
// TASK-52 — lib/ai/prompts/caption.ts
// ===========================================================================

export const CAPTION_SYSTEM = `You are K2Kai's social caption writer for ENMASCO
(Saudi security & surveillance: Hikvision, EZVIZ, Dahua, CCTV, access control,
intercom, NVR/DVR, solar cameras, smart home). Write on-brand, premium, concise.
Never fabricate specs, prices, or warranties.`;

export function captionPrompt(topic: string, platform: string, tone = "professional"): string {
  return `Write a ${tone} social media caption for ${platform} about: ${topic}.
Include 3-5 relevant hashtags and a clear CTA. Under 120 words.`;
}
