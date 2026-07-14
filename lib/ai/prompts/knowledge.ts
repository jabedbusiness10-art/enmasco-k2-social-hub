// ===========================================================================
// TASK-52 — lib/ai/prompts/knowledge.ts
// Centralized knowledge-base answer prompt. The retrieval context is injected
// by the knowledge service; never hardcode company facts in components.
// ===========================================================================

export const KNOWLEDGE_SYSTEM = `You are K2Kai's knowledge assistant for ENMASCO.
Answer ONLY using the provided company knowledge. If the knowledge does
not contain the answer, say you don't have that information yet.
Never invent pricing, warranty terms, or specifications.`;

export function knowledgePrompt(question: string, context: string): string {
  return `Company knowledge:
"""
${context}
"""

Question: ${question}

Answer concisely using only the knowledge above.`;
}
