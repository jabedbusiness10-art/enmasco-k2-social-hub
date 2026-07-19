import { prisma } from "@/lib/db";
import { getAIProvider, tokenEstimate, type ChatMessage, type GenerateOptions } from "./provider";

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------
export async function listConversations(userId: string, module = "CHAT") {
  return prisma.aIConversation.findMany({
    where: { userId, module },
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" }, take: 50 } },
  });
}

export async function createConversation(userId: string, module: string, title?: string) {
  return prisma.aIConversation.create({
    data: { userId, module, title: title ?? "New Conversation" },
  });
}

export async function getConversation(id: string, userId: string) {
  return prisma.aIConversation.findFirst({ where: { id, userId }, include: { messages: { orderBy: { createdAt: "asc" } } } });
}

// ---------------------------------------------------------------------------
// Chat (streaming) + persistence
// ---------------------------------------------------------------------------
export async function streamChat(
  userId: string,
  conversationId: string | null,
  userContent: string,
  opts: GenerateOptions,
) {
  const provider = getAIProvider();
  const convId = conversationId ?? (await createConversation(userId, opts.model ?? "CHAT", userContent.slice(0, 40))).id;

  await prisma.aIMessage.create({
    data: { conversationId: convId, role: "user", content: userContent, tokensUsed: tokenEstimate(userContent) },
  });

  const history = await prisma.aIMessage.findMany({
    where: { conversationId: convId },
    orderBy: { createdAt: "asc" },
  });
  const messages: ChatMessage[] = [
    ...(opts.systemPrompt ? [{ role: "system" as const, content: opts.systemPrompt }] : []),
    ...history.map((m) => ({ role: m.role as ChatMessage["role"], content: m.content })),
  ];

  let full = "";
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of provider.streamChat(messages, opts)) {
          full += chunk;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: chunk })}\n\n`));
        }
        await prisma.aIMessage.create({
          data: { conversationId: convId, role: "assistant", content: full, tokensUsed: tokenEstimate(full) },
        });
        await logTokenUsage({
          userId,
          conversationId: convId,
          module: opts.model ?? "CHAT",
          promptTokens: tokenEstimate(userContent),
          completionTokens: tokenEstimate(full),
          model: provider.id,
        });
        await prisma.aIConversation.update({ where: { id: convId }, data: { updatedAt: new Date() } }).catch(() => {});
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        controller.close();
      } catch (e: any) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: e.message ?? "stream failed" })}\n\n`));
        controller.close();
      }
    },
  });

  return { stream, conversationId: convId };
}

// ---------------------------------------------------------------------------
// Non-streaming generation (captions, planner, etc.)
// ---------------------------------------------------------------------------
export async function generateContent(userId: string, prompt: string, opts: GenerateOptions) {
  const provider = getAIProvider();
  const messages: ChatMessage[] = [
    ...(opts.systemPrompt ? [{ role: "system" as const, content: opts.systemPrompt }] : []),
    { role: "user", content: prompt },
  ];
  let full = "";
  for await (const chunk of provider.streamChat(messages, opts)) full += chunk;
  await logTokenUsage({
    userId,
    module: "GENERATE",
    promptTokens: tokenEstimate(prompt),
    completionTokens: tokenEstimate(full),
    model: provider.id,
  });
  return full;
}

// ---------------------------------------------------------------------------
// Token usage + dashboard stats
// ---------------------------------------------------------------------------
export async function logTokenUsage(d: {
  userId: string;
  conversationId?: string | null;
  module: string;
  promptTokens: number;
  completionTokens: number;
  model: string;
}) {
  return prisma.aITokenUsage.create({
    data: {
      userId: d.userId,
      conversationId: d.conversationId ?? null,
      module: d.module,
      promptTokens: d.promptTokens,
      completionTokens: d.completionTokens,
      totalTokens: d.promptTokens + d.completionTokens,
      model: d.model,
    },
  });
}

export async function getAIStats(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [todayUsage, allUsage, successRate] = await Promise.all([
    prisma.aITokenUsage.findMany({ where: { userId, createdAt: { gte: today } } }),
    prisma.aITokenUsage.findMany({ where: { userId } }),
    prisma.aITokenUsage.count({ where: { userId } }),
  ]);
  const totalTokensToday = todayUsage.reduce((s, u) => s + u.totalTokens, 0);
  const totalTokens = allUsage.reduce((s, u) => s + u.totalTokens, 0);
  const provider = getAIProvider();
  return {
    totalRequests: successRate,
    successRate: 100,
    tokensToday: totalTokensToday,
    tokensTotal: totalTokens,
    aiStatus: provider.isConfigured ? "ONLINE" : "DEMO",
    model: provider.id,
    providerLabel: provider.label,
  };
}

// ---------------------------------------------------------------------------
// Prompt Library
// ---------------------------------------------------------------------------
export async function listPrompts(userId: string) {
  return prisma.aIPrompt.findMany({ where: { createdById: userId }, orderBy: [{ favorite: "desc" }, { updatedAt: "desc" }] });
}

export async function createPrompt(userId: string, data: { title: string; prompt: string; category?: string; favorite?: boolean }) {
  return prisma.aIPrompt.create({ data: { createdById: userId, ...data } });
}

export async function updatePrompt(userId: string, id: string, data: Partial<{ title: string; prompt: string; category: string; favorite: boolean }>) {
  return prisma.aIPrompt.update({ where: { id }, data });
}

export async function deletePrompt(userId: string, id: string) {
  return prisma.aIPrompt.delete({ where: { id } });
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
export async function getSettings() {
  const s = await prisma.aISettings.findUnique({ where: { id: "singleton" } });
  if (s) return s;
  return prisma.aISettings.create({ data: { id: "singleton" } });
}

export async function saveSettings(data: Partial<{
  model: string; provider: string; temperature: number; maxTokens: number;
  streaming: boolean; systemPrompt: string; defaultLanguage: string;
}>) {
  return prisma.aISettings.upsert({ where: { id: "singleton" }, update: data, create: { id: "singleton", ...data } });
}
