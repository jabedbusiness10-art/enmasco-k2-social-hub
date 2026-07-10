import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { streamChat } from "@/services/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requirePermission("VIEW_AI", req);
  if (!auth.ok || !auth.user) return new Response(JSON.stringify({ error: auth.error }), { status: 401, headers: { "Content-Type": "application/json" } });

  const body = await req.json().catch(() => ({}));
  const { conversationId, content, model, temperature, maxTokens, systemPrompt } = body;
  if (!content || typeof content !== "string") {
    return new Response(JSON.stringify({ error: "content is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const { stream, conversationId: cid } = await streamChat(auth.user.id, conversationId ?? null, content, {
    model, temperature, maxTokens, systemPrompt, stream: true,
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Conversation-Id": cid,
    },
  });
}
