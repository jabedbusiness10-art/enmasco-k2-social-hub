// ===========================================================================
// TASK-52 — lib/ai/providers/providerManager.ts
// Central provider manager. All AI requests route through here; switching
// providers (OpenAI/Gemini/Claude/Ollama) requires NO app-code change.
// Reuses the existing AIProvider abstraction in ../provider.
// ===========================================================================

import {
  getAIProvider,
  type AIProvider,
  type ChatMessage,
  type GenerateOptions,
} from "@/services/ai/provider";

export type ProviderId = "openrouter" | "openai" | "gemini" | "claude" | "ollama" | "mock";

export interface ProviderInfo {
  id: ProviderId;
  label: string;
  configured: boolean;
  status: "online" | "demo" | "offline";
}

// Future providers plug in here with the same AIProvider interface.
// Gemini / Claude / Ollama stubs are registered so the UI can show
// their status; they activate once their SDK + env keys are added.
const REGISTRY: Record<ProviderId, () => AIProvider> = {
  openrouter: () => getAIProvider(),
  openai: () => getAIProvider(),
  gemini: () => getAIProvider(), // TODO: add GeminiProvider when SDK ready
  claude: () => getAIProvider(), // TODO: add ClaudeProvider when SDK ready
  ollama: () => getAIProvider(), // TODO: add OllamaProvider (local LLM)
  mock: () => getAIProvider(),
};

/** Resolve the active provider (env AI_PROVIDER or default). */
export function getActiveProvider(): AIProvider {
  return getAIProvider();
}

/** Stream a chat completion through the active provider. */
export async function* streamThroughManager(
  messages: ChatMessage[],
  opts: GenerateOptions,
): AsyncIterable<string> {
  yield* getActiveProvider().streamChat(messages, opts);
}

/** Non-streaming generation through the active provider. */
export async function generateThroughManager(
  prompt: string,
  opts: GenerateOptions,
): Promise<string> {
  const provider = getActiveProvider();
  const messages: ChatMessage[] = [
    ...(opts.systemPrompt ? [{ role: "system" as const, content: opts.systemPrompt }] : []),
    { role: "user", content: prompt },
  ];
  let full = "";
  for await (const chunk of provider.streamChat(messages, opts)) full += chunk;
  return full;
}

/** List all known providers + their configured/status for the AI Studio UI. */
export function listProviders(activeId: string): ProviderInfo[] {
  const active = getActiveProvider();
  const def: ProviderInfo[] = [
    { id: "openrouter", label: "OpenRouter", configured: Boolean(process.env.OPENROUTER_API_KEY), status: "online" },
    { id: "openai", label: "OpenAI", configured: Boolean(process.env.OPENAI_API_KEY), status: "offline" },
    { id: "gemini", label: "Google Gemini", configured: false, status: "offline" },
    { id: "claude", label: "Anthropic Claude", configured: false, status: "offline" },
    { id: "ollama", label: "Local LLM (Ollama)", configured: false, status: "offline" },
  ];
  return def.map((p) => ({
    ...p,
    status: p.id === activeId ? (active.isConfigured ? "online" : "demo") : p.status,
  }));
}
