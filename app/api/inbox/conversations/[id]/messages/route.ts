import { NextRequest, NextResponse } from "next/server";
import { requireInboxPermission, canViewAllInbox } from "@/services/inbox/auth";
import { listInboxMessages } from "@/services/inbox/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireInboxPermission("VIEW_INBOX", req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;
  const result = await listInboxMessages({ id: auth.user.id, name: auth.user.name, canViewAll: await canViewAllInbox(auth.user) }, id, Number(req.nextUrl.searchParams.get("page") || 1), Number(req.nextUrl.searchParams.get("take") || 50));
  return result ? NextResponse.json(result) : NextResponse.json({ error: "Conversation not found" }, { status: 404 });
}
