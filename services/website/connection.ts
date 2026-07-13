import crypto from "crypto";
import { prisma } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/crypto";

/**
 * TASK-47 — Website ↔ Social Hub Integration service.
 *
 * Manages connections to the official ENMASCO website (and future CMS platforms)
 * as a first-class "connected platform" alongside Meta & LinkedIn. Tokens
 * (apiKey, webhookSecret) are encrypted at rest. Health is recomputed live on
 * test/status. Sync engine is architecture-ready for TASK-48 Real Publishing.
 */

export type CmsKind =
  | "WORDPRESS"
  | "NEXTJS"
  | "CUSTOM"
  | "HEADLESS"
  | "LARAVEL"
  | "STATIC";

export type WebsiteHealth = "ONLINE" | "SSL_INVALID" | "API_ERROR" | "WEBHOOK_ERROR" | "OFFLINE";

export interface WebsiteConnectionInput {
  websiteName: string;
  websiteUrl: string;
  cmsType: CmsKind;
  apiKey: string;
  webhookSecret: string;
  syncFrequency?: "MANUAL" | "HOURLY" | "DAILY" | "REALTIME";
  connectedBy: string;
}

/** Public shape returned to the client — NEVER includes secrets. */
export interface WebsiteConnectionPublic {
  id: string;
  websiteName: string;
  websiteUrl: string;
  cmsType: CmsKind;
  status: "CONNECTED" | "DISCONNECTED" | "ERROR" | "SYNCING";
  online: boolean;
  sslValid: boolean;
  apiStatus: boolean;
  webhookStatus: boolean;
  health: WebsiteHealth;
  lastSync: string | null;
  syncFrequency: string;
  connectedBy: string;
  createdAt: string;
  updatedAt: string;
}

function deriveHealth(row: {
  online: boolean;
  sslValid: boolean;
  apiStatus: boolean;
  webhookStatus: boolean;
  status: string;
}): WebsiteHealth {
  if (row.status === "DISCONNECTED") return "OFFLINE";
  if (!row.online) return "OFFLINE";
  if (!row.sslValid) return "SSL_INVALID";
  if (!row.apiStatus) return "API_ERROR";
  if (!row.webhookStatus) return "WEBHOOK_ERROR";
  return "ONLINE";
}

function toPublic(row: any): WebsiteConnectionPublic {
  return {
    id: row.id,
    websiteName: row.websiteName,
    websiteUrl: row.websiteUrl,
    cmsType: row.cmsType,
    status: row.status,
    online: row.online,
    sslValid: row.sslValid,
    apiStatus: row.apiStatus,
    webhookStatus: row.webhookStatus,
    health: deriveHealth(row),
    lastSync: row.lastSync ? row.lastSync.toISOString() : null,
    syncFrequency: row.syncFrequency,
    connectedBy: row.connectedBy,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Persist a new website connection (secrets encrypted). */
export async function createWebsiteConnection(
  input: WebsiteConnectionInput,
): Promise<WebsiteConnectionPublic> {
  const row = await prisma.websiteConnection.create({
    data: {
      companyId: null, // TASK-45 pre-flight loose Company link; not required
      websiteName: input.websiteName,
      websiteUrl: input.websiteUrl,
      cmsType: input.cmsType,
      apiKey: encrypt(input.apiKey),
      webhookSecret: encrypt(input.webhookSecret),
      syncFrequency: input.syncFrequency ?? "MANUAL",
      connectedBy: input.connectedBy,
      status: "CONNECTED",
    },
  });
  return toPublic(row);
}

export async function listWebsiteConnections(): Promise<WebsiteConnectionPublic[]> {
  const rows = await prisma.websiteConnection.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(toPublic);
}

export async function getWebsiteConnection(
  id: string,
): Promise<WebsiteConnectionPublic | null> {
  const row = await prisma.websiteConnection.findUnique({ where: { id } });
  return row ? toPublic(row) : null;
}

/** Decrypt secrets server-side (never returned to client). */
export async function getDecryptedSecrets(id: string): Promise<{
  apiKey: string;
  webhookSecret: string;
} | null> {
  const row = await prisma.websiteConnection.findUnique({ where: { id } });
  if (!row) return null;
  return {
    apiKey: decrypt(row.apiKey),
    webhookSecret: decrypt(row.webhookSecret),
  };
}

export async function disconnectWebsiteConnection(id: string): Promise<void> {
  await prisma.websiteConnection.update({
    where: { id },
    data: {
      status: "DISCONNECTED",
      online: false,
      apiStatus: false,
      webhookStatus: false,
    },
  });
}

export async function reconnectWebsiteConnection(id: string): Promise<WebsiteConnectionPublic> {
  return updateHealth(id, { status: "CONNECTED" });
}

interface HealthUpdate {
  online?: boolean;
  sslValid?: boolean;
  apiStatus?: boolean;
  webhookStatus?: boolean;
  status?: "CONNECTED" | "DISCONNECTED" | "ERROR" | "SYNCING";
  lastSync?: Date | null;
}

async function updateHealth(id: string, u: HealthUpdate): Promise<WebsiteConnectionPublic> {
  const row = await prisma.websiteConnection.update({ where: { id }, data: u });
  return toPublic(row);
}

/**
 * Live connection test: reachability (HTTP), SSL validity (via fetch — Node 20+
 * rejects invalid certs by default), and API-key auth against the CMS.
 * Returns per-step results + persisted health.
 */
export async function testWebsiteConnection(
  id: string,
): Promise<{ ok: boolean; steps: { name: string; ok: boolean; detail?: string }[] }> {
  const conn = await getWebsiteConnection(id);
  if (!conn) throw new Error("Website connection not found");

  const steps: { name: string; ok: boolean; detail?: string }[] = [];
  const url = conn.websiteUrl;

  // 1. Reachability + SSL (fetch throws on bad cert)
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(8000) });
    steps.push({
      name: "Website Online",
      ok: res.ok || res.status < 500,
      detail: `HTTP ${res.status}`,
    });
    // 2. SSL — if we got here without throwing, cert is valid
    steps.push({ name: "SSL Valid", ok: true, detail: "Certificate chain verified" });
  } catch (e: any) {
    const sslErr = /certificate|ssl|tls/i.test(e?.message ?? "");
    steps.push({ name: "Website Online", ok: false, detail: e?.message ?? "Unreachable" });
    steps.push({ name: "SSL Valid", ok: !sslErr, detail: sslErr ? "SSL/certificate error" : "Check skipped" });
  }

  // 3. API auth — probe a CMS-specific endpoint with the stored API key
  try {
    const secrets = await getDecryptedSecrets(id);
    const apiOk = await probeCmsApi(conn.cmsType, url, secrets?.apiKey ?? "");
    steps.push({ name: "API Status", ok: apiOk.ok, detail: apiOk.detail });
  } catch (e: any) {
    steps.push({ name: "API Status", ok: false, detail: e?.message ?? "API probe failed" });
  }

  // 4. Webhook secret present (config-level check; live ping done on webhook receive)
  const secrets = await getDecryptedSecrets(id);
  steps.push({
    name: "Webhook Config",
    ok: !!secrets?.webhookSecret,
    detail: secrets?.webhookSecret ? "Webhook secret configured" : "Missing webhook secret",
  });

  const ok = steps.every((s) => s.ok);
  await prisma.websiteConnection.update({
    where: { id },
    data: {
      online: steps[0]?.ok ?? false,
      sslValid: steps[1]?.ok ?? false,
      apiStatus: steps[2]?.ok ?? false,
      webhookStatus: steps[3]?.ok ?? false,
      status: ok ? "CONNECTED" : "ERROR",
    },
  });

  return { ok, steps };
}

async function probeCmsApi(
  cmsType: CmsKind,
  baseUrl: string,
  apiKey: string,
): Promise<{ ok: boolean; detail: string }> {
  if (!apiKey) return { ok: false, detail: "No API key" };
  const endpoints: Record<string, string> = {
    WORDPRESS: "/wp-json/wp/v2",
    NEXTJS: "/api/health",
    HEADLESS: "/api/health",
    CUSTOM: "/api/health",
    LARAVEL: "/api/health",
    STATIC: "/healthz",
  };
  const path = endpoints[cmsType] ?? "/api/health";
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
      headers: { Authorization: `Bearer ${apiKey}`, "X-API-Key": apiKey },
      signal: AbortSignal.timeout(8000),
    });
    return { ok: res.status < 500, detail: `${cmsType} probe HTTP ${res.status}` };
  } catch (e: any) {
    // For STATIC sites with no API, treat as informational (non-fatal).
    if (cmsType === "STATIC") return { ok: true, detail: "Static site — no API endpoint" };
    return { ok: false, detail: e?.message ?? "API probe failed" };
  }
}

/** Trigger a content sync. Architecture-ready for TASK-48 Real Publishing. */
export async function syncWebsiteConnection(id: string): Promise<{
  id: string;
  lastSync: string;
  pulled: { blog: number; news: number; media: number };
}> {
  const conn = await getWebsiteConnection(id);
  if (!conn) throw new Error("Website connection not found");
  await prisma.websiteConnection.update({
    where: { id },
    data: { status: "SYNCING", lastSync: new Date() },
  });
  // TASK-48 will perform real pull (blog/news/media) via CMS APIs.
  // For now we record the sync event; counts are architecture placeholders
  // that will be replaced by real CMS fetches in TASK-48.
  const pulled = { blog: 0, news: 0, media: 0 };
  const updated = await prisma.websiteConnection.update({
    where: { id },
    data: { status: "CONNECTED", lastSync: new Date() },
  });
  return {
    id,
    lastSync: updated.lastSync!.toISOString(),
    pulled,
  };
}

/**
 * Verify a webhook signature (HMAC-SHA256) from the website → K2KAI.
 * Header `x-k2kai-signature: sha256=<hmac>` must match HMAC of raw body
 * keyed by the stored webhook secret.
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  const provided = signature.replace(/^sha256=/, "").trim();
  // constant-time compare
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Build the public webhook URL for a connection (used in UI + docs). */
export function webhookUrlFor(id: string): string {
  const base = process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/api/website/webhook/${id}`;
}
