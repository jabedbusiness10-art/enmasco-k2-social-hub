import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireInboxPermission } from "@/services/inbox/auth";
import { syncYouTubeComments } from "@/services/inbox/providers";
import { checkInboxRateLimit } from "@/services/inbox/rate-limit";

const schema = z.object({ accountId: z.string().min(1), maxPages: z.number().int().min(1).max(10).default(2) });
export async function POST(req: NextRequest) {
  const auth = await requireInboxPermission("MANAGE_INBOX_SETTINGS", req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid YouTube sync request" }, { status: 400 });
  const rate = checkInboxRateLimit(`youtube-sync:${body.data.accountId}`, 4, 60_000);
  if (!rate.allowed) return NextResponse.json({ error: "YouTube sync rate limit exceeded" }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });
  try { return NextResponse.json(await syncYouTubeComments(body.data.accountId, body.data.maxPages)); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "YouTube sync failed" }, { status: 422 }); }
}
