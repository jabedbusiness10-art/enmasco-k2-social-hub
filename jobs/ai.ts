import { generateContent } from "@/services/ai";
import { getAIProvider } from "@/services/ai/provider";

/**
 * TASK-57 — AI job handlers.
 * Routes ai:* sub-jobs to the real AI provider (OpenRouter tencent/hy3).
 */
export async function handleAI(job: { name: string; data: any }): Promise<any> {
  const { kind, userId, prompt, opts } = job.data ?? {};
  switch (kind) {
    case "reply":
    case "caption":
    case "translate":
    case "moderation":
    case "image-analysis":
      if (!prompt) throw new Error("AI job missing prompt");
      return generateContent(userId ?? "system", prompt, opts ?? { task: kind });
    default:
      // Verify provider is reachable (no-op generation).
      getAIProvider();
      return { ok: true, kind };
  }
}
