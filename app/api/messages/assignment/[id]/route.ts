import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { assignConversation } from "@/services/messaging/conversations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.assignedToId) return Response.json({ error: "assignedToId required" }, { status: 400 });
  const assignment = await assignConversation(id, String(body.assignedToId), user.id);
  return Response.json({ assignment }, { status: 201 });
}
