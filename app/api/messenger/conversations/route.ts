import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { listConversationsForUser } from "@/services/messenger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind") ?? undefined;
  const archivedRaw = searchParams.get("archived");
  const archived = archivedRaw === "true" ? true : archivedRaw === "false" ? false : undefined;

  const conversations = await listConversationsForUser(user.id, { kind, archived });
  return new Response(JSON.stringify({ conversations }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
