import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireInboxPermission, canViewAllInbox } from "@/services/inbox/auth";
import { updateInboxTags } from "@/services/inbox/service";

const schema = z.object({ add: z.array(z.string().trim().min(1).max(80)).max(50).default([]), remove: z.array(z.string().trim().min(1).max(80)).max(50).default([]) });
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireInboxPermission("MANAGE_CONVERSATION", req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid tags" }, { status: 400 });
  const conversation = await updateInboxTags({ id: auth.user.id, name: auth.user.name, canViewAll: await canViewAllInbox(auth.user) }, (await params).id, body.data.add, body.data.remove, req);
  return NextResponse.json({ conversation });
}
