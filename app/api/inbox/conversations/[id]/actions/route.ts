import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireInboxPermission, canViewAllInbox } from "@/services/inbox/auth";
import { updateInboxAction } from "@/services/inbox/service";

const schema = z.object({ action: z.enum(["read", "unread", "star", "archive", "spam", "priority", "status"]), value: z.unknown() });
export const runtime = "nodejs";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid conversation action" }, { status: 400 });
  const required = body.data.action === "spam" ? "MANAGE_SPAM" : "MANAGE_CONVERSATION";
  const auth = await requireInboxPermission(required, req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const { id } = await params;
    const conversation = await updateInboxAction({ id: auth.user.id, name: auth.user.name, canViewAll: await canViewAllInbox(auth.user) }, id, body.data.action, body.data.value, req);
    return NextResponse.json({ conversation });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Action failed" }, { status: 422 }); }
}
