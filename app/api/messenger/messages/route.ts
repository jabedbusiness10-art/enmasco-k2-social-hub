import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { createMessage, updateMessage, deleteMessage, recallMessage, toggleReaction, markRead } from "@/services/messenger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

  const body = await req.json().catch(() => ({}));
  const { conversationId, content, replyToId, mentions, attachments, voice, forwardedFromId } = body;

  if (!conversationId) return new Response(JSON.stringify({ error: "conversationId required" }), { status: 400, headers: { "Content-Type": "application/json" } });

  // Persist via service (the realtime broadcast is handled by the socket server).
  const msg = await createMessage({
    conversationId,
    senderId: user.id,
    senderName: user.name,
    content: content ?? "",
    replyToId: replyToId ?? null,
    mentions: mentions ?? [],
    attachments,
    voice,
    forwardedFromId: forwardedFromId ?? null,
  });
  return new Response(JSON.stringify({ message: msg }), { status: 201, headers: { "Content-Type": "application/json" } });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

  const body = await req.json().catch(() => ({}));
  const { messageId, action, content, emoji } = body;
  if (!messageId) return new Response(JSON.stringify({ error: "messageId required" }), { status: 400, headers: { "Content-Type": "application/json" } });

  try {
    if (action === "edit") {
      const msg = await updateMessage(messageId, user.id, content ?? "");
      return new Response(JSON.stringify({ message: msg }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (action === "delete") {
      const msg = await deleteMessage(messageId, user.id);
      return new Response(JSON.stringify({ message: msg }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (action === "recall") {
      const msg = await recallMessage(messageId, user.id);
      return new Response(JSON.stringify({ message: msg }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (action === "react") {
      const msg = await toggleReaction(messageId, user.id, emoji);
      return new Response(JSON.stringify({ message: msg }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (action === "read") {
      await markRead(body.conversationId, user.id);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: "unknown action" }), { status: 400, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message ?? "failed" }), { status: 403, headers: { "Content-Type": "application/json" } });
  }
}
