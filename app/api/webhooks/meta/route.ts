import { NextRequest, NextResponse } from "next/server";
import { processMetaWebhook, verifyMetaChallenge, verifyMetaWebhookSignature } from "@/services/inbox/meta-webhook";
import { checkInboxRateLimit } from "@/services/inbox/rate-limit";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");
  if (!challenge || !verifyMetaChallenge(mode, token)) return NextResponse.json({ error: "Webhook verification failed" }, { status: 403 });
  return new NextResponse(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  const rate = checkInboxRateLimit(`meta-webhook:${ip}`, 600, 60_000);
  if (!rate.allowed) return NextResponse.json({ error: "Webhook rate limit exceeded" }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });
  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > 1024 * 1024) return NextResponse.json({ error: "Webhook payload too large" }, { status: 413 });
  const raw = await req.text();
  if (Buffer.byteLength(raw) > 1024 * 1024) return NextResponse.json({ error: "Webhook payload too large" }, { status: 413 });
  if (!verifyMetaWebhookSignature(raw, req.headers.get("x-hub-signature-256"))) return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  const payload = await Promise.resolve().then(() => JSON.parse(raw)).catch(() => null);
  if (!payload || !["page", "instagram"].includes(payload.object)) return NextResponse.json({ error: "Invalid Meta webhook payload" }, { status: 400 });
  const result = await processMetaWebhook(payload);
  return NextResponse.json({ received: true, processed: result.processed, duplicates: result.duplicates });
}
