import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { searchSocialConversations } from "@/services/messaging/conversations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const conversations = await searchSocialConversations(user.id, q);
  return Response.json({ conversations });
}
