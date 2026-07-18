import { NextRequest, NextResponse } from "next/server";
import { getDecryptedSecrets, processWebsiteWebhook, verifyWebhookSignature } from "@/services/website/connection";
import { asPublicIntegrationError, IntegrationError } from "@/services/integrations/errors";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const declaredSize = Number(req.headers.get("content-length") || 0);
  if (declaredSize > 1024 * 1024) return NextResponse.json({ error: "Webhook payload too large" }, { status: 413 });
  const { id } = await params;
  const rawBody = await req.text();
  if (Buffer.byteLength(rawBody) > 1024 * 1024) return NextResponse.json({ error: "Webhook payload too large" }, { status: 413 });
  const signature = req.headers.get("x-k2kai-signature");
  const timestamp = req.headers.get("x-k2kai-timestamp");
  const eventId = req.headers.get("x-k2kai-event-id");
  if (!eventId || eventId.length > 200) return NextResponse.json({ error: "Missing webhook event ID" }, { status: 400 });

  const secrets = await getDecryptedSecrets(id).catch(() => null);
  if (!secrets?.webhookSecret) return NextResponse.json({ error: "Unknown webhook target" }, { status: 404 });
  if (!verifyWebhookSignature(rawBody, signature, secrets.webhookSecret, timestamp)) {
    const publicError = asPublicIntegrationError(new IntegrationError("WEBSITE", "WEBHOOK_SIGNATURE_INVALID", "Webhook signature or timestamp is invalid", 401, false, "Sign timestamp.payload with the configured HMAC secret."), "WEBSITE");
    return NextResponse.json(publicError.error, { status: publicError.status });
  }
  const payload = await Promise.resolve().then(() => JSON.parse(rawBody || "{}")).catch(() => null);
  if (!payload || typeof payload !== "object") return NextResponse.json({ error: "Invalid webhook JSON" }, { status: 400 });
  const eventType = String(payload.event ?? payload.type ?? "");
  try {
    const result = await processWebsiteWebhook(id, eventId, eventType, rawBody, payload.data ?? payload);
    return NextResponse.json(result);
  } catch (error) {
    const publicError = asPublicIntegrationError(error, "WEBSITE");
    return NextResponse.json(publicError.error, { status: publicError.status });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405, headers: { Allow: "POST" } });
}
