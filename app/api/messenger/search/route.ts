import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) return new Response(JSON.stringify({ results: [] }), { status: 200, headers: { "Content-Type": "application/json" } });

  const messages = await prisma.message.findMany({
    where: {
      isRecalled: false,
      isDeleted: false,
      OR: [{ content: { contains: q, mode: "insensitive" } }, { senderName: { contains: q, mode: "insensitive" } }],
      conversation: { members: { some: { userId: user.id } } },
    },
    include: {
      conversation: { select: { id: true, title: true, kind: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const conversations = await prisma.conversation.findMany({
    where: {
      members: { some: { userId: user.id } },
      OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }],
    },
    select: { id: true, title: true, kind: true, avatarUrl: true, description: true },
    take: 20,
  });

  const results = [
    ...conversations.map((c) => ({ type: "conversation", id: c.id, title: c.title, kind: c.kind, avatarUrl: c.avatarUrl, description: c.description })),
    ...messages.map((m) => ({
      type: "message",
      id: m.id,
      conversationId: m.conversationId,
      conversationTitle: m.conversation?.title ?? "Conversation",
      senderName: m.senderName,
      senderAvatar: null,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
  ];

  return new Response(JSON.stringify({ results }), { status: 200, headers: { "Content-Type": "application/json" } });
}
