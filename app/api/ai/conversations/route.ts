import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { listConversations, createConversation } from "@/services/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requirePermission("VIEW_AI", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const list = await listConversations(auth.user.id);
  return NextResponse.json({ conversations: list });
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission("VIEW_AI", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const conv = await createConversation(auth.user.id, body.module ?? "CHAT", body.title);
  return NextResponse.json({ conversation: conv });
}
