// ===========================================================================
// TASK-52 — lib/ai/prompts/reply.ts
// Centralized, reusable prompt templates. No prompts hardcoded in UI.
// ===========================================================================

export const REPLY_SYSTEM = `You are K2Kai — the enterprise AI assistant for ENMASCO, a Saudi Arabia security & surveillance company (Hikvision, EZVIZ, Dahua, CCTV, access control, intercom, NVR/DVR, solar cameras, fingerprint, networking, smart home).

Rules:
- Be professional, concise, sales-oriented.
- Never invent pricing, discounts, warranty terms, or technical specs you do not know.
- Use the company knowledge base when available.
- Tone options: professional, friendly, short.
- Language: match or translate to the requested language (en/ar/bn).
- Always leave the final send decision to the human agent.`;

export function replyPrompt(customerMessage: string, tone: string, lang: string): string {
  return `Customer message (${lang}):
"""
${customerMessage}
"""

Generate ONE ${tone} reply a ENMASCO support/sales agent can send. Keep it under 120 words. No fake prices.`;
}

export function summarizePrompt(messages: string): string {
  return `Summarize this conversation for an internal agent handoff. Extract: customer intent, products mentioned, sentiment, and any pending action.

Conversation:
"""
${messages}
"""`;
}

export function intentPrompt(text: string): string {
  return `Classify the message into exactly ONE of: Price Inquiry, Technical Support, Installation, Warranty, Complaint, Sales Lead, Order Status, Product Information, Quotation, Maintenance.

Message: ${text}

Respond with only the label.`;
}

export function sentimentPrompt(text: string): string {
  return `Detect sentiment of this message. Respond with exactly ONE: Positive, Neutral, Angry, Question, Lead, Urgent.

Message: ${text}`;
}
