import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getConversationThread } from "@/services/messaging/conversations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const thread = await getConversationThread(id, user.id, 50);
  if (!thread) return Response.json({ error: "Conversation not found" }, { status: 404 });

  return Response.json(thread);
}
