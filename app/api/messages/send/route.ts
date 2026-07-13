import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { sendSocialMessage } from "@/services/messaging/conversations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.conversationId || !body?.content) {
    return Response.json({ error: "conversationId and content required" }, { status: 400 });
  }

  const msg = await sendSocialMessage(
    body.conversationId,
    user.id,
    user.name ?? "Agent",
    String(body.content),
    Array.isArray(body.attachments) ? body.attachments : [],
  );
  return Response.json({ message: msg }, { status: 201 });
}
