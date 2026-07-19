// Provider abstraction for K2Kai. Swap providers (OpenAI/Gemini/Claude) via env
// without touching the UI or service layer. When no API key is configured we
// fall back to a clearly-labeled offline demo provider so the UI is fully usable.

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface GenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  stream?: boolean;
}

export interface AIProvider {
  id: string;
  label: string;
  isConfigured: boolean;
  /** Stream a completion as an async iterable of text chunks. */
  streamChat(messages: ChatMessage[], opts: GenerateOptions): AsyncIterable<string>;
}

function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

// ---------------------------------------------------------------------------
// Mock / offline provider — used when no real key is present.
// ---------------------------------------------------------------------------
class MockProvider implements AIProvider {
  id = "mock";
  label = "K2Kai Demo (Offline)";
  isConfigured = false;

  async *streamChat(messages: ChatMessage[], opts: GenerateOptions): AsyncIterable<string> {
    const last = [...messages].reverse().find((m) => m.role === "user");
    const userText = last?.content ?? "";
    const reply = buildMockReply(userText, opts);
    // stream word-by-word for a realistic typing effect
    const words = reply.split(/(\s+)/);
    for (const w of words) {
      await new Promise((r) => setTimeout(r, 18));
      yield w;
    }
  }
}

function buildMockReply(prompt: string, opts: GenerateOptions): string {
  const lower = prompt.toLowerCase();
  const topic = prompt.trim().slice(0, 60) || "your ENMASCO campaign";

  if (lower.includes("caption") || lower.includes("instagram") || lower.includes("facebook")) {
    return `**${topic}**\n\nHere's a ready-to-publish social caption drafted by K2Kai:\n\n> Protect what matters most. ENMASCO Security delivers enterprise-grade CCTV & smart surveillance across Saudi Arabia. 🛡️\n\n**Hashtags:** #SecurityMatters #CCTV #SaudiSecurity #ENMASCO #SmartSurveillance\n\n**CTA:** 👉 Book a free site survey today.\n\n> _Demo mode: connect an OpenAI/Gemini/Claude key in \`.env.local\` to enable live generation._`;
  }

  if (lower.includes("planner") || lower.includes("plan") || lower.includes("schedule")) {
    return `**Content Plan — ${topic}**\n\n| # | Variation | Best Time |\n|---|-----------|-----------|\n| 1 | Carousel: "5 Signs You Need Better CCTV" | Tue 11:00 |\n| 2 | Reel: 15s threat demo | Thu 18:30 |\n| 3 | Story poll: "Rate your home security" | Sat 20:00 |\n\n**Growth tip:** Post Reels Tue/Thu evenings — highest ENMASCO audience engagement.`;
  }

  return `**K2Kai Response**\n\nYou asked: _"${topic}"_\n\nAs ENMASCO K2 SOCIAL's enterprise AI copilot, I can help with social captions, content planning, hashtag research, analytics insights, and automation drafts. This is a **demo response** — wire a real provider in \`.env.local\` (\`AI_PROVIDER=openai\`, \`OPENAI_API_KEY=...\`) to get live, context-aware answers.\n\n\`\`\`json\n{ "provider": "${opts.model ?? "k2kai-demo"}", "streaming": true }\n\`\`\``;
}

// ---------------------------------------------------------------------------
// OpenRouter provider (OpenAI-compatible API, any model e.g. tencent/hy3)
// ---------------------------------------------------------------------------
class OpenRouterProvider implements AIProvider {
  id = "openrouter";
  label = "OpenRouter";
  isConfigured = Boolean(process.env.OPENROUTER_API_KEY);

  async *streamChat(messages: ChatMessage[], opts: GenerateOptions): AsyncIterable<string> {
    if (!this.isConfigured) {
      yield* new MockProvider().streamChat(messages, opts);
      return;
    }
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });
    const stream = await client.chat.completions.create({
      model: opts.model ?? process.env.AI_MODEL ?? "tencent/hy3",
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 1024,
      stream: true,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) yield delta;
    }
  }
}

// ---------------------------------------------------------------------------
// OpenAI provider (lazy import so missing SDK never crashes the app).
// ---------------------------------------------------------------------------
class OpenAIProvider implements AIProvider {
  id = "openai";
  label = "OpenAI API";
  isConfigured = Boolean(process.env.OPENAI_API_KEY);

  async *streamChat(messages: ChatMessage[], opts: GenerateOptions): AsyncIterable<string> {
    if (!this.isConfigured) {
      yield* new MockProvider().streamChat(messages, opts);
      return;
    }
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const stream = await client.responses.create({
      model: opts.model ?? process.env.AI_MODEL ?? "gpt-5.6-sol",
      max_output_tokens: opts.maxTokens ?? 1024,
      stream: true,
      input: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    for await (const event of stream) {
      if (event.type === "response.output_text.delta" && event.delta) yield event.delta;
    }
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------
let cached: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cached) return cached;
  const requested = (process.env.AI_PROVIDER ?? "mock").toLowerCase();
  switch (requested) {
    case "openrouter":
      cached = new OpenRouterProvider();
      break;
    case "openai":
      cached = new OpenAIProvider();
      break;
    // gemini / claude providers can be added here with the same interface.
    default:
      cached = new MockProvider();
  }
  return cached;
}

export function tokenEstimate(text: string): number {
  return estimateTokens(text);
}

/**
 * TASK-65 — AI translation via the active provider.
 * Never mutates caller state; returns only the translated string.
 * Falls back to a clearly-labeled echo when no provider is configured.
 */
export async function translateText(text: string, targetLang: string, sourceLang = "en"): Promise<string> {
  if (!text || !text.trim()) return text;
  const provider = getAIProvider();
  const system = `You are a professional enterprise localization engine for K2KAI Social Flow (ENMASCO). Translate the user's text from ${sourceLang} to ${targetLang}. Preserve meaning, tone, brand names (K2KAI, ENMASCO), hashtags, emojis, and placeholders. Respond with ONLY the translated text, no quotes, no commentary.`;
  let out = "";
  for await (const chunk of provider.streamChat([{ role: "user", content: text }], { systemPrompt: system, temperature: 0.3, maxTokens: 1024 })) {
    out += chunk;
  }
  return out.trim() || text;
}
