import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireInboxPermission, canViewAllInbox } from "@/services/inbox/auth";
import { assignInboxConversation } from "@/services/inbox/service";

const schema = z.object({ assignedToId: z.string().min(1).nullable() });
export const runtime = "nodejs";

async function mutate(req: NextRequest, id: string, assignedToId: string | null) {
  const auth = await requireInboxPermission("ASSIGN_CONVERSATION", req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const assignment = await assignInboxConversation({ id: auth.user.id, name: auth.user.name, canViewAll: await canViewAllInbox(auth.user) }, id, assignedToId, req);
    return NextResponse.json({ assignment });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Assignment failed" }, { status: 422 }); }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid assignment" }, { status: 400 });
  return mutate(req, (await params).id, parsed.data.assignedToId);
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) { return mutate(req, (await params).id, null); }
