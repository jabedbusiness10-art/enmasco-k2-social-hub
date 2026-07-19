import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireInboxPermission, canViewAllInbox } from "@/services/inbox/auth";
import { addInboxNote, getInboxConversation } from "@/services/inbox/service";

const schema = z.object({ content: z.string().trim().min(1).max(10_000), mentions: z.array(z.string().min(1)).max(50).default([]) });
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireInboxPermission("VIEW_INBOX", req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const result = await getInboxConversation({ id: auth.user.id, name: auth.user.name, canViewAll: await canViewAllInbox(auth.user) }, (await params).id);
  return result ? NextResponse.json({ notes: result.notes }) : NextResponse.json({ error: "Conversation not found" }, { status: 404 });
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireInboxPermission("ADD_INTERNAL_NOTE", req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid note" }, { status: 400 });
  const note = await addInboxNote({ id: auth.user.id, name: auth.user.name, canViewAll: await canViewAllInbox(auth.user) }, (await params).id, body.data.content, body.data.mentions, req);
  return NextResponse.json({ note }, { status: 201 });
}
