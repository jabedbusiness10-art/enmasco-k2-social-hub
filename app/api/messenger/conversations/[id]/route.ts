import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getConversation, getMessages, getPinnedMessages } from "@/services/messenger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(_req);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

  const { id } = await params;
  const conversation = await getConversation(id, user.id);
  if (!conversation) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "Content-Type": "application/json" } });

  const { searchParams } = new URL(_req.url);
  const tab = searchParams.get("tab");
  if (tab === "pinned") {
    const pinned = await getPinnedMessages(id, user.id);
    return new Response(JSON.stringify({ pinned }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  const take = Number(searchParams.get("take") ?? 50);
  const cursor = searchParams.get("cursor") ?? undefined;
  const { messages, hasMore } = await getMessages(id, user.id, take, cursor);

  return new Response(JSON.stringify({ conversation, messages, hasMore }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
