import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireInboxPermission, canViewAllInbox } from "@/services/inbox/auth";
import { updateInboxAction } from "@/services/inbox/service";

const schema = z.object({ status: z.enum(["OPEN", "PENDING", "RESOLVED", "CLOSED"]) });
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireInboxPermission("MANAGE_CONVERSATION", req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const conversation = await updateInboxAction({ id: auth.user.id, name: auth.user.name, canViewAll: await canViewAllInbox(auth.user) }, (await params).id, "status", body.data.status, req);
  return NextResponse.json({ conversation });
}
