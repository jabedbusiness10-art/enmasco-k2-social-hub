import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireInboxPermission, canViewAllInbox } from "@/services/inbox/auth";
import { sendInboxReply } from "@/services/inbox/providers";
import { checkInboxRateLimit } from "@/services/inbox/rate-limit";

const schema = z.object({ text: z.string().trim().max(10_000).default(""), attachments: z.array(z.string().url()).max(10).default([]) }).refine((v) => v.text.length > 0 || v.attachments.length > 0, "Reply content is required");
export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireInboxPermission("REPLY_INBOX", req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const rate = checkInboxRateLimit(`reply:${auth.user.id}`, 30, 60_000);
  if (!rate.allowed) return NextResponse.json({ error: "Reply rate limit exceeded" }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid reply", issues: parsed.error.flatten() }, { status: 400 });
  try {
    const { id } = await params;
    const message = await sendInboxReply({ id: auth.user.id, name: auth.user.name, canViewAll: await canViewAllInbox(auth.user) }, id, parsed.data.text, parsed.data.attachments, req);
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Reply failed" }, { status: 422 });
  }
}
