import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Lightweight translation using the existing AI service as a fallback.
// For production this is where a dedicated translation provider (DeepL / Google)
// would plug in. We keep the interface stable: { text, from, to } -> { translated }.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

  const body = await req.json().catch(() => ({}));
  const { text, to } = body;
  if (!text || !to) return new Response(JSON.stringify({ error: "text and to required" }), { status: 400, headers: { "Content-Type": "application/json" } });

  try {
    const { streamChat } = await import("@/services/ai");
    const prompt = `Translate the following text to ${to}. Respond with ONLY the translated text, no quotes, no commentary:\n\n"${text}"`;
    const { stream } = await streamChat(user.id, null, prompt, { stream: false });
    const reader = (stream as ReadableStream).getReader();
    const decoder = new TextDecoder();
    const chunks: string[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(decoder.decode(value, { stream: true }));
    }
    const translated = chunks.join("").replace(/^data:/gm, "").replace(/^["']|["']$/g, "").trim();
    return new Response(JSON.stringify({ translated }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message ?? "translate failed" }), { status: 502, headers: { "Content-Type": "application/json" } });
  }
}
