import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireInboxPermission, canViewAllInbox } from "@/services/inbox/auth";
import { runInboxAI } from "@/services/inbox/ai";
import { checkInboxRateLimit } from "@/services/inbox/rate-limit";

const schema = z.object({ conversationId: z.string().min(1), action: z.enum(["reply", "summary", "translate", "tone", "next_action", "sentiment", "intent"]), language: z.enum(["English", "Arabic", "Bangla"]).default("English"), tone: z.enum(["professional", "friendly", "short", "detailed"]).default("professional"), draft: z.string().max(10_000).optional() });
export async function POST(req: NextRequest) {
  const auth = await requireInboxPermission("USE_AI_ASSISTANT", req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const rate = checkInboxRateLimit(`inbox-ai:${auth.user.id}`, 20, 60_000);
  if (!rate.allowed) return NextResponse.json({ error: "AI rate limit exceeded" }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid AI request" }, { status: 400 });
  try {
    const result = await runInboxAI({ id: auth.user.id, name: auth.user.name, canViewAll: await canViewAllInbox(auth.user) }, body.data.conversationId, body.data.action, body.data.language, body.data.tone, body.data.draft);
    return NextResponse.json(result);
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "K2KAI request failed" }, { status: 422 }); }
}
