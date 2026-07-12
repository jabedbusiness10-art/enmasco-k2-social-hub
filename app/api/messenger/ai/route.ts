import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { streamChat } from "@/services/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Lightweight AI assist for the composer: smart reply / rewrite / summary / tasks.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

  const body = await req.json().catch(() => ({}));
  const { type, text, history } = body;
  if (!text || typeof text !== "string") return new Response(JSON.stringify({ error: "text required" }), { status: 400, headers: { "Content-Type": "application/json" } });

  const promptByType: Record<string, string> = {
    reply: `Suggest a concise, professional reply to the following message. Keep it under 2 sentences:\n\n"${text}"`,
    rewrite: `Rewrite the following message to be clearer and more professional, keep the meaning:\n\n"${text}"`,
    grammar: `Fix grammar and spelling only, keep the wording as close as possible:\n\n"${text}"`,
    summary: `Summarize the following conversation snippet in 2-3 bullet points:\n\n${history ?? text}`,
    tasks: `Extract concrete action items / tasks from the following text as a short checklist:\n\n"${text}"`,
    reminder: `Convert the following into a short calendar reminder phrase (what + when):\n\n"${text}"`,
    meeting: `Draft a short meeting agenda (5 items max) based on the following context:\n\n"${text}"`,
  };

  const prompt = promptByType[type] ?? promptByType.reply;
  try {
    const { stream } = await streamChat(user.id, null, prompt, { stream: false });
    const chunks: string[] = [];
    // streamChat returns a ReadableStream; collect it.
    const reader = (stream as ReadableStream).getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(decoder.decode(value, { stream: true }));
    }
    return new Response(JSON.stringify({ result: chunks.join("").replace(/^data:/gm, "").trim() }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message ?? "ai failed" }), { status: 502, headers: { "Content-Type": "application/json" } });
  }
}
