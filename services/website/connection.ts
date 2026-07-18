import crypto from "node:crypto";
import { Prisma, type CmsType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/crypto";
import { IntegrationError } from "@/services/integrations/errors";
import { assertPublicWebsiteUrl, safeWebsiteFetch } from "./security";
import { getWebsiteProvider, type WebsiteContentItem, type WebsitePublishInput } from "./providers";

export type WebsiteHealth = "ONLINE" | "SSL_INVALID" | "API_ERROR" | "WEBHOOK_ERROR" | "OFFLINE";

export interface WebsiteConnectionInput {
  websiteName: string;
  websiteUrl: string;
  cmsType: CmsType;
  apiKey?: string | null;
  webhookSecret?: string | null;
  apiEndpoint?: string | null;
  authMethod?: string | null;
  syncFrequency?: "MANUAL" | "HOURLY" | "DAILY" | "REALTIME";
  connectedBy: string;
  connectedById: string;
}

export interface WebsiteConnectionPublic {
  id: string;
  websiteName: string;
  websiteUrl: string;
  cmsType: CmsType;
  apiEndpoint: string | null;
  authMethod: string;
  status: "CONNECTED" | "DISCONNECTED" | "ERROR" | "SYNCING";
  online: boolean;
  sslValid: boolean;
  apiStatus: boolean;
  webhookStatus: boolean;
  health: WebsiteHealth;
  lastSync: string | null;
  lastPublish: string | null;
  lastWebhook: string | null;
  lastError: string | null;
  syncFrequency: string;
  publishingEnabled: boolean;
  capabilities: Record<string, boolean>;
  authStatus: string;
  connectedBy: string;
  createdAt: string;
  updatedAt: string;
}

function deriveHealth(row: { online: boolean; sslValid: boolean; apiStatus: boolean; status: string }): WebsiteHealth {
  if (row.status === "DISCONNECTED" || !row.online) return "OFFLINE";
  if (!row.sslValid) return "SSL_INVALID";
  if (!row.apiStatus) return "API_ERROR";
  return "ONLINE";
}

function toPublic(row: any): WebsiteConnectionPublic {
  return {
    id: row.id,
    websiteName: row.websiteName,
    websiteUrl: row.websiteUrl,
    cmsType: row.cmsType,
    apiEndpoint: row.apiEndpoint ?? null,
    authMethod: row.authMethod ?? "NONE",
    status: row.status,
    online: row.online,
    sslValid: row.sslValid,
    apiStatus: row.apiStatus,
    webhookStatus: row.webhookStatus,
    health: deriveHealth(row),
    lastSync: row.lastSync?.toISOString() ?? null,
    lastPublish: row.lastPublish?.toISOString() ?? null,
    lastWebhook: row.lastWebhook?.toISOString() ?? null,
    lastError: row.lastError ?? null,
    syncFrequency: row.syncFrequency,
    publishingEnabled: row.publishingEnabled,
    capabilities: (row.providerCapabilities as Record<string, boolean> | null) ?? {},
    authStatus: row.authStatus ?? "UNKNOWN",
    connectedBy: row.connectedBy,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function allowHttp(): boolean {
  return process.env.ALLOW_INSECURE_WEBSITE_HTTP === "true" && process.env.NODE_ENV !== "production";
}

export async function createWebsiteConnection(input: WebsiteConnectionInput): Promise<WebsiteConnectionPublic> {
  const baseUrl = await assertPublicWebsiteUrl(input.websiteUrl, { allowHttp: allowHttp() });
  const apiEndpoint = input.apiEndpoint ? await assertPublicWebsiteUrl(new URL(input.apiEndpoint, baseUrl).toString(), { allowHttp: allowHttp() }) : null;
  const provider = getWebsiteProvider(input.cmsType);
  const authMethod = (input.authMethod ?? (input.apiKey ? "BEARER" : "NONE")).toUpperCase();
  if (authMethod !== "NONE" && !input.apiKey) {
    throw new IntegrationError("WEBSITE", "AUTH_FAILED", "The selected authentication method requires a credential", 400, false, "Enter the website API credential.");
  }
  const row = await prisma.websiteConnection.create({
    data: {
      companyId: null,
      websiteName: input.websiteName.trim().slice(0, 160),
      websiteUrl: baseUrl.toString(),
      cmsType: input.cmsType,
      apiKey: input.apiKey ? encrypt(input.apiKey) : null,
      webhookSecret: input.webhookSecret ? encrypt(input.webhookSecret) : null,
      apiEndpoint: apiEndpoint?.toString() ?? null,
      authMethod,
      providerCapabilities: provider.capabilities as any,
      syncFrequency: input.syncFrequency ?? "MANUAL",
      connectedBy: input.connectedBy,
      connectedById: input.connectedById,
      status: "CONNECTED",
      online: false,
      apiStatus: false,
      webhookStatus: Boolean(input.webhookSecret),
      authStatus: authMethod === "NONE" ? "NOT_REQUIRED" : "UNTESTED",
      publishingEnabled: provider.capabilities.publish,
    },
  });
  return toPublic(row);
}

export async function listWebsiteConnections(): Promise<WebsiteConnectionPublic[]> {
  return (await prisma.websiteConnection.findMany({ orderBy: { createdAt: "desc" } })).map(toPublic);
}

export async function getWebsiteConnection(id: string): Promise<WebsiteConnectionPublic | null> {
  const row = await prisma.websiteConnection.findUnique({ where: { id } });
  return row ? toPublic(row) : null;
}

export async function getDecryptedSecrets(id: string): Promise<{ apiKey: string; webhookSecret: string } | null> {
  const row = await prisma.websiteConnection.findUnique({ where: { id } });
  if (!row) return null;
  return {
    apiKey: row.apiKey ? decrypt(row.apiKey) : "",
    webhookSecret: row.webhookSecret ? decrypt(row.webhookSecret) : "",
  };
}

async function internalConnection(id: string) {
  const row = await prisma.websiteConnection.findUnique({ where: { id } });
  if (!row) throw new IntegrationError("WEBSITE", "ENDPOINT_UNAVAILABLE", "Website connection was not found", 404, false, "Select an existing website connection.");
  const secrets = await getDecryptedSecrets(id);
  return {
    row,
    provider: getWebsiteProvider(row.cmsType),
    context: {
      baseUrl: row.websiteUrl,
      apiEndpoint: row.apiEndpoint,
      apiKey: secrets?.apiKey ?? null,
      authMethod: row.authMethod,
      cursor: row.syncCursor,
    },
  };
}

export async function disconnectWebsiteConnection(id: string): Promise<void> {
  await prisma.websiteConnection.update({ where: { id }, data: { status: "DISCONNECTED", online: false, apiStatus: false } });
}

export async function reconnectWebsiteConnection(id: string): Promise<WebsiteConnectionPublic> {
  const row = await prisma.websiteConnection.update({ where: { id }, data: { status: "CONNECTED", lastError: null } });
  return toPublic(row);
}

export async function testWebsiteConnection(id: string) {
  const { row, provider, context } = await internalConnection(id);
  const steps: { name: string; ok: boolean; detail?: string }[] = [];
  try {
    const response = await safeWebsiteFetch(row.websiteUrl, { method: "HEAD" }, { allowHttp: allowHttp(), timeoutMs: 8_000 });
    steps.push({ name: "Website Online", ok: response.ok || response.status < 500, detail: `HTTP ${response.status}` });
    steps.push({ name: "SSL Valid", ok: new URL(row.websiteUrl).protocol === "https:", detail: new URL(row.websiteUrl).protocol === "https:" ? "TLS endpoint verified" : "Development HTTP override" });
  } catch (error) {
    steps.push({ name: "Website Online", ok: false, detail: error instanceof Error ? error.message : "Unreachable" });
    steps.push({ name: "SSL Valid", ok: false, detail: "Connection could not be verified" });
  }
  let authStatus = "UNKNOWN";
  try {
    const result = await provider.test(context);
    authStatus = result.authStatus;
    steps.push({ name: "Provider API", ok: result.ok, detail: result.detail });
  } catch (error) {
    authStatus = error instanceof IntegrationError && error.code === "AUTH_FAILED" ? "FAILED" : "UNKNOWN";
    steps.push({ name: "Provider API", ok: false, detail: error instanceof Error ? error.message : "Provider test failed" });
  }
  const secrets = await getDecryptedSecrets(id);
  steps.push({ name: "Webhook HMAC", ok: !provider.capabilities.webhook || Boolean(secrets?.webhookSecret), detail: secrets?.webhookSecret ? "Signing secret configured" : "Optional webhook not configured" });
  const coreOk = Boolean(steps[0]?.ok && steps[1]?.ok && steps[2]?.ok);
  await prisma.websiteConnection.update({
    where: { id },
    data: {
      online: Boolean(steps[0]?.ok),
      sslValid: Boolean(steps[1]?.ok),
      apiStatus: Boolean(steps[2]?.ok),
      webhookStatus: Boolean(secrets?.webhookSecret),
      authStatus,
      status: coreOk ? "CONNECTED" : "ERROR",
      lastError: coreOk ? null : steps.find((step) => !step.ok)?.detail?.slice(0, 280) ?? "Connection test failed",
    },
  });
  return { ok: coreOk, steps, capabilities: provider.capabilities };
}

async function resolveSyncUser(row: any): Promise<string> {
  if (row.connectedById) return row.connectedById;
  const fallback = await prisma.user.findFirst({ where: { OR: [{ email: row.connectedBy }, { name: row.connectedBy }] }, select: { id: true } });
  if (!fallback) throw new IntegrationError("WEBSITE", "AUTH_FAILED", "Website connection has no valid content owner", 409, true, "Reconnect the website with an authenticated user.");
  return fallback.id;
}

async function upsertWebsiteItem(connectionId: string, provider: CmsType, createdById: string, item: WebsiteContentItem) {
  const existing = await prisma.post.findUnique({ where: { sourceConnectionId_externalContentId: { sourceConnectionId: connectionId, externalContentId: item.externalId } }, select: { id: true } });
  const post = await prisma.post.upsert({
    where: { sourceConnectionId_externalContentId: { sourceConnectionId: connectionId, externalContentId: item.externalId } },
    create: {
      platform: "WEBSITE",
      status: item.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      title: item.title,
      content: item.content ?? item.excerpt,
      mediaUrl: item.featuredImage,
      link: item.canonicalUrl,
      canonicalUrl: item.canonicalUrl,
      externalContentId: item.externalId,
      sourceConnectionId: connectionId,
      sourceProvider: provider,
      sourceMetadata: { categories: item.categories, tags: item.tags, author: item.author, ...item.metadata } as any,
      lastExternalSyncAt: new Date(),
      publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
      tags: [...new Set([...item.categories, ...item.tags])],
      createdById,
    },
    update: {
      title: item.title,
      content: item.content ?? item.excerpt,
      mediaUrl: item.featuredImage,
      link: item.canonicalUrl,
      canonicalUrl: item.canonicalUrl,
      sourceMetadata: { categories: item.categories, tags: item.tags, author: item.author, ...item.metadata } as any,
      lastExternalSyncAt: new Date(),
      publishedAt: item.publishedAt ? new Date(item.publishedAt) : undefined,
      tags: [...new Set([...item.categories, ...item.tags])],
    },
  });
  return { post, created: !existing };
}

export async function syncWebsiteConnection(id: string) {
  const { row, provider, context } = await internalConnection(id);
  if (!provider.capabilities.sync) throw new IntegrationError("WEBSITE", "UNSUPPORTED_PROVIDER", "This provider does not support pull synchronization", 409, false, "Use signed webhooks for this connection.");
  await prisma.websiteConnection.update({ where: { id }, data: { status: "SYNCING", lastError: null } });
  try {
    const result = await provider.sync(context);
    const createdById = await resolveSyncUser(row);
    let imported = 0;
    let updated = 0;
    for (const item of result.items) {
      const write = await upsertWebsiteItem(id, row.cmsType, createdById, item);
      write.created ? imported += 1 : updated += 1;
    }
    const finishedAt = new Date();
    await prisma.websiteConnection.update({ where: { id }, data: { status: "CONNECTED", lastSync: finishedAt, syncCursor: result.nextCursor, online: true, apiStatus: true, lastError: null } });
    return { id, lastSync: finishedAt.toISOString(), imported, updated, skipped: 0, pulled: { blog: imported + updated, news: 0, media: result.items.filter((item) => item.featuredImage).length }, nextCursor: result.nextCursor };
  } catch (error) {
    await prisma.websiteConnection.update({ where: { id }, data: { status: "ERROR", lastError: (error instanceof Error ? error.message : "Sync failed").slice(0, 280) } });
    throw error;
  }
}

export async function publishWebsiteConnection(id: string, input: WebsitePublishInput) {
  const { provider, context } = await internalConnection(id);
  if (!provider.capabilities.publish) throw new IntegrationError("WEBSITE", "READ_ONLY_PROVIDER", "This website provider does not support publishing", 409, false, "Choose an authenticated WordPress or REST provider.");
  try {
    const result = await provider.publish(context, input);
    await prisma.websiteConnection.update({ where: { id }, data: { lastPublish: new Date(), status: "CONNECTED", online: true, apiStatus: true, lastError: null } });
    return result;
  } catch (error) {
    await prisma.websiteConnection.update({ where: { id }, data: { lastError: (error instanceof Error ? error.message : "Publish failed").slice(0, 280) } });
    throw error;
  }
}

export function verifyWebhookSignature(rawBody: string, signature: string | null, secret: string, timestamp: string | null): boolean {
  if (!signature || !secret || !timestamp || !/^\d{10,13}$/.test(timestamp)) return false;
  const timeMs = timestamp.length === 10 ? Number(timestamp) * 1000 : Number(timestamp);
  if (!Number.isFinite(timeMs) || Math.abs(Date.now() - timeMs) > 5 * 60_000) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  const provided = signature.replace(/^sha256=/, "").trim();
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function processWebsiteWebhook(connectionId: string, eventId: string, eventType: string, rawBody: string, payload: any) {
  const payloadHash = crypto.createHash("sha256").update(rawBody).digest("hex");
  try {
    await prisma.websiteWebhookDelivery.create({ data: { connectionId, eventId, eventType, payloadHash } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new IntegrationError("WEBSITE", "DUPLICATE_CONTENT", "Webhook event was already processed", 409, false, "Do not replay an accepted webhook event.");
    }
    throw error;
  }
  const connection = await prisma.websiteConnection.findUnique({ where: { id: connectionId } });
  if (!connection) throw new IntegrationError("WEBSITE", "ENDPOINT_UNAVAILABLE", "Website connection not found", 404, false, "Use a valid webhook target.");

  if (["article.created", "article.updated", "article.published"].includes(eventType)) {
    const canonicalUrl = String(payload?.canonicalUrl ?? payload?.url ?? "");
    const externalId = String(payload?.externalId ?? payload?.id ?? "");
    if (!canonicalUrl || !externalId) throw new IntegrationError("WEBSITE", "API_ERROR", "Webhook article requires externalId and canonicalUrl", 422, false, "Send the documented article payload.");
    await assertPublicWebsiteUrl(canonicalUrl, { allowHttp: allowHttp() });
    await upsertWebsiteItem(connectionId, connection.cmsType, await resolveSyncUser(connection), {
      externalId,
      title: String(payload?.title ?? "Untitled").slice(0, 300),
      content: typeof payload?.content === "string" ? payload.content.slice(0, 200_000) : null,
      excerpt: typeof payload?.excerpt === "string" ? payload.excerpt.slice(0, 5_000) : null,
      canonicalUrl,
      featuredImage: typeof payload?.featuredImage === "string" ? payload.featuredImage : null,
      categories: Array.isArray(payload?.categories) ? payload.categories.map(String).slice(0, 50) : [],
      tags: Array.isArray(payload?.tags) ? payload.tags.map(String).slice(0, 50) : [],
      author: typeof payload?.author === "string" ? payload.author.slice(0, 160) : null,
      publishedAt: payload?.publishedAt ?? null,
      modifiedAt: payload?.modifiedAt ?? new Date().toISOString(),
      status: eventType === "article.published" ? "PUBLISHED" : String(payload?.status ?? "DRAFT").toUpperCase(),
    });
  } else if (eventType === "article.deleted") {
    const externalId = String(payload?.externalId ?? payload?.id ?? "");
    if (!externalId) throw new IntegrationError("WEBSITE", "API_ERROR", "Webhook delete requires externalId", 422, false, "Send the remote content identifier.");
    await prisma.post.deleteMany({ where: { sourceConnectionId: connectionId, externalContentId: externalId, platform: "WEBSITE" } });
  } else if (eventType !== "connection.test") {
    throw new IntegrationError("WEBSITE", "API_ERROR", "Unsupported website webhook event", 422, false, "Use article.created, article.updated, article.published, article.deleted, or connection.test.");
  }

  const now = new Date();
  await prisma.$transaction([
    prisma.websiteWebhookDelivery.update({ where: { connectionId_eventId: { connectionId, eventId } }, data: { status: "PROCESSED", processedAt: now } }),
    prisma.websiteConnection.update({ where: { id: connectionId }, data: { lastWebhook: now, webhookStatus: true, lastError: null } }),
  ]);
  return { ok: true, eventId, eventType };
}

export function webhookUrlFor(id: string): string {
  const base = process.env.NEXTAUTH_URL ?? process.env.APP_URL;
  if (!base) return `/api/website/webhook/${id}`;
  return `${base.replace(/\/$/, "")}/api/website/webhook/${id}`;
}
