import { NextRequest, NextResponse } from "next/server";
import { getDecryptedSecrets, verifyWebhookSignature } from "@/services/website/connection";

export const runtime = "nodejs";

/**
 * TASK-47 — Secure inbound webhook from a Website/CMS → K2KAI.
 *
 * The website signs each request with HMAC-SHA256 of the raw body keyed by the
 * stored webhook secret, sent in header `x-k2kai-signature: sha256=<hmac>`.
 * We verify before trusting the payload, then forward to the Publishing Engine
 * (architecture hook for TASK-48). Unverified requests are rejected (401).
 *
 * NOTE: signature verification needs the RAW body. `req.text()` preserves bytes.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rawBody = await req.text();
  const signature = req.headers.get("x-k2kai-signature");

  let secrets: { apiKey: string; webhookSecret: string } | null = null;
  try {
    secrets = await getDecryptedSecrets(id);
  } catch {
    secrets = null;
  }
  if (!secrets?.webhookSecret) {
    return NextResponse.json({ error: "Unknown or unconfigured webhook target" }, { status: 404 });
  }
  if (!verifyWebhookSignature(rawBody, signature, secrets.webhookSecret)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  let payload: any = {};
  try {
    payload = JSON.parse(rawBody || "{}");
  } catch {
    payload = {};
  }

  // TASK-48 hook: route verified events to the Publishing Engine / Analytics.
  // For now we acknowledge and record the receipt (logging point).
  // Event types: content.published | content.updated | media.uploaded ...
  return NextResponse.json({ ok: true, received: payload?.event ?? "unknown" });
}

/** Webhook endpoint must not be cached / should reject GET probes. */
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
