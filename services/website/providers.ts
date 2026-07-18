import type { CmsType } from "@prisma/client";
import crypto from "node:crypto";
import { IntegrationError } from "@/services/integrations/errors";
import { readLimitedText, safeWebsiteFetch } from "./security";

export type WebsiteCapabilityStatus = "AVAILABLE" | "NOT_AUTHORIZED" | "UNSUPPORTED" | "TEMPORARILY_UNAVAILABLE" | "NO_DATA";

export interface WebsiteProviderCapabilities {
  sync: boolean;
  publish: boolean;
  update: boolean;
  webhook: boolean;
  readOnly: boolean;
}

export interface WebsiteProviderContext {
  baseUrl: string;
  apiEndpoint?: string | null;
  apiKey?: string | null;
  authMethod?: string | null;
  cursor?: string | null;
}

export interface WebsiteContentItem {
  externalId: string;
  title: string;
  content: string | null;
  excerpt: string | null;
  canonicalUrl: string;
  featuredImage: string | null;
  categories: string[];
  tags: string[];
  author: string | null;
  publishedAt: string | null;
  modifiedAt: string | null;
  status: string;
  metadata?: Record<string, unknown>;
}

export interface WebsiteSyncResult {
  items: WebsiteContentItem[];
  nextCursor: string | null;
}

export interface WebsitePublishInput {
  externalId?: string;
  title: string;
  content: string;
  excerpt?: string;
  status: "draft" | "publish";
  featuredImage?: string;
  categories?: string[];
  tags?: string[];
  canonicalUrl?: string;
}

export interface WebsitePublishResult {
  externalId: string;
  canonicalUrl: string | null;
  status: string;
}

export interface WebsiteProvider {
  kind: CmsType;
  capabilities: WebsiteProviderCapabilities;
  test(context: WebsiteProviderContext): Promise<{ ok: boolean; detail: string; authStatus: string }>;
  sync(context: WebsiteProviderContext): Promise<WebsiteSyncResult>;
  publish(context: WebsiteProviderContext, input: WebsitePublishInput): Promise<WebsitePublishResult>;
}

function authHeaders(context: WebsiteProviderContext): HeadersInit {
  const method = (context.authMethod ?? "NONE").toUpperCase();
  const key = context.apiKey ?? "";
  if (!key || method === "NONE") return {};
  if (method === "BEARER") return { Authorization: `Bearer ${key}` };
  if (method === "API_KEY") return { "X-API-Key": key };
  if (method === "BASIC" || method === "WORDPRESS_APP_PASSWORD") {
    return { Authorization: `Basic ${Buffer.from(key).toString("base64")}` };
  }
  throw new IntegrationError("WEBSITE", "AUTH_FAILED", "Unsupported website authentication method", 400, false, "Use NONE, BEARER, API_KEY, BASIC, or WORDPRESS_APP_PASSWORD.");
}

function endpoint(context: WebsiteProviderContext, fallback: string): string {
  return new URL(context.apiEndpoint || fallback, context.baseUrl).toString();
}

async function fetchJson(url: string, context: WebsiteProviderContext, init: RequestInit = {}) {
  const response = await safeWebsiteFetch(url, { ...init, headers: { ...authHeaders(context), ...(init.headers ?? {}) } });
  const text = await readLimitedText(response);
  const payload = text ? JSON.parse(text) : {};
  if (response.status === 401 || response.status === 403) throw new IntegrationError("WEBSITE", "AUTH_FAILED", "Website provider rejected the configured credential", 401, true, "Update the website authentication credential.");
  if (response.status === 429) throw new IntegrationError("WEBSITE", "RATE_LIMITED", "Website provider rate limit reached", 429, true, "Retry after the provider rate-limit window.", Number(response.headers.get("retry-after")) || 30);
  if (!response.ok) throw new IntegrationError("WEBSITE", "API_ERROR", `Website provider returned HTTP ${response.status}`, response.status, response.status >= 500, "Review the provider endpoint response.");
  return { payload, response };
}

function cleanText(value: unknown): string {
  return String(value ?? "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, " ").trim();
}

function stableId(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function tag(block: string, names: string[]): string {
  for (const name of names) {
    const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
    if (match) return cleanText(match[1]);
    const href = block.match(new RegExp(`<${name}[^>]*href=["']([^"']+)["'][^>]*>`, "i"));
    if (href) return href[1];
  }
  return "";
}

function normalizeRestItem(item: any): WebsiteContentItem | null {
  const canonicalUrl = String(item.canonicalUrl ?? item.link ?? item.url ?? "").trim();
  const externalId = String(item.externalId ?? item.id ?? canonicalUrl).trim();
  if (!externalId || !canonicalUrl) return null;
  return {
    externalId,
    title: cleanText(item.title?.rendered ?? item.title ?? "Untitled"),
    content: cleanText(item.content?.rendered ?? item.content ?? item.body) || null,
    excerpt: cleanText(item.excerpt?.rendered ?? item.excerpt ?? item.summary) || null,
    canonicalUrl,
    featuredImage: item.featuredImage ?? item.image ?? item._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null,
    categories: Array.isArray(item.categories) ? item.categories.map(String) : [],
    tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
    author: cleanText(item.author?.name ?? item._embedded?.author?.[0]?.name ?? item.author) || null,
    publishedAt: item.publishedAt ?? item.date_gmt ?? item.date ?? null,
    modifiedAt: item.modifiedAt ?? item.modified_gmt ?? item.modified ?? null,
    status: String(item.status ?? "published").toUpperCase(),
  };
}

const readOnlyPublish = async (): Promise<never> => {
  throw new IntegrationError("WEBSITE", "READ_ONLY_PROVIDER", "This website provider is read-only", 409, false, "Use WordPress or an authenticated REST provider to publish.");
};

function restProvider(kind: CmsType, wordpress = false): WebsiteProvider {
  return {
    kind,
    capabilities: { sync: true, publish: true, update: true, webhook: true, readOnly: false },
    async test(context) {
      const url = endpoint(context, wordpress ? "/wp-json/wp/v2/posts?per_page=1" : "/api/content?limit=1");
      const { response } = await fetchJson(url, context);
      return { ok: true, detail: `Provider responded HTTP ${response.status}`, authStatus: context.apiKey ? "AUTHORIZED" : "ANONYMOUS" };
    },
    async sync(context) {
      const base = endpoint(context, wordpress ? "/wp-json/wp/v2/posts" : "/api/content");
      const url = new URL(base);
      if (wordpress) {
        url.searchParams.set("per_page", "50");
        url.searchParams.set("_embed", "1");
        if (context.cursor) url.searchParams.set("modified_after", context.cursor);
      } else {
        url.searchParams.set("limit", "100");
        if (context.cursor) url.searchParams.set("cursor", context.cursor);
      }
      const { payload, response } = await fetchJson(url.toString(), context);
      const rawItems: any[] = Array.isArray(payload) ? payload : Array.isArray(payload.items) ? payload.items : [];
      const items: WebsiteContentItem[] = rawItems.map((item: any) => normalizeRestItem(item)).filter((item: WebsiteContentItem | null): item is WebsiteContentItem => item !== null);
      const newest = items.map((item) => item.modifiedAt ?? item.publishedAt).filter(Boolean).sort().pop() ?? null;
      return { items, nextCursor: payload.nextCursor ?? newest ?? response.headers.get("x-next-cursor") };
    },
    async publish(context, input) {
      const base = endpoint(context, wordpress ? "/wp-json/wp/v2/posts" : "/api/content");
      const url = input.externalId ? `${base.replace(/\/$/, "")}/${encodeURIComponent(input.externalId)}` : base;
      const body = wordpress
        ? { title: input.title, content: input.content, excerpt: input.excerpt, status: input.status, categories: input.categories, tags: input.tags }
        : input;
      const { payload } = await fetchJson(url, context, { method: input.externalId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const externalId = String(payload.id ?? payload.externalId ?? input.externalId ?? "");
      if (!externalId) throw new IntegrationError("WEBSITE", "API_ERROR", "Website publish response did not include a remote content ID", 502, true, "Update the provider response contract.");
      return { externalId, canonicalUrl: payload.link ?? payload.canonicalUrl ?? payload.url ?? null, status: String(payload.status ?? input.status).toUpperCase() };
    },
  };
}

const rssProvider: WebsiteProvider = {
  kind: "RSS",
  capabilities: { sync: true, publish: false, update: false, webhook: false, readOnly: true },
  async test(context) {
    const response = await safeWebsiteFetch(endpoint(context, "/feed"));
    const contentType = response.headers.get("content-type") ?? "";
    return { ok: response.ok && /xml|rss|atom/i.test(contentType), detail: `Feed responded HTTP ${response.status}`, authStatus: "NOT_REQUIRED" };
  },
  async sync(context) {
    const response = await safeWebsiteFetch(endpoint(context, "/feed"));
    if (!response.ok) throw new IntegrationError("WEBSITE", "ENDPOINT_UNAVAILABLE", `Feed returned HTTP ${response.status}`, 502, true, "Check the RSS or Atom endpoint.");
    const xml = await readLimitedText(response);
    const blocks = [...xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)].slice(0, 200);
    const items = blocks.map((match) => {
      const block = match[2];
      const canonicalUrl = tag(block, ["link"]);
      const external = tag(block, ["guid", "id"]) || canonicalUrl;
      return normalizeRestItem({ externalId: external, title: tag(block, ["title"]), content: tag(block, ["content:encoded", "content", "description"]), excerpt: tag(block, ["summary", "description"]), canonicalUrl, author: tag(block, ["dc:creator", "author", "name"]), publishedAt: tag(block, ["pubDate", "published", "updated"]), modifiedAt: tag(block, ["updated"]), status: "PUBLISHED" });
    }).filter((item): item is WebsiteContentItem => Boolean(item));
    const nextCursor = items.map((item) => item.modifiedAt ?? item.publishedAt).filter(Boolean).sort().pop() ?? context.cursor ?? null;
    return { items, nextCursor };
  },
  publish: readOnlyPublish,
};

const sitemapProvider: WebsiteProvider = {
  kind: "SITEMAP",
  capabilities: { sync: true, publish: false, update: false, webhook: false, readOnly: true },
  async test(context) {
    const response = await safeWebsiteFetch(endpoint(context, "/sitemap.xml"));
    return { ok: response.ok, detail: `Sitemap responded HTTP ${response.status}`, authStatus: "NOT_REQUIRED" };
  },
  async sync(context) {
    const response = await safeWebsiteFetch(endpoint(context, "/sitemap.xml"));
    if (!response.ok) throw new IntegrationError("WEBSITE", "ENDPOINT_UNAVAILABLE", `Sitemap returned HTTP ${response.status}`, 502, true, "Check the XML sitemap endpoint.");
    const xml = await readLimitedText(response);
    const items = [...xml.matchAll(/<url(?:\s[^>]*)?>([\s\S]*?)<\/url>/gi)].slice(0, 500).map((match): WebsiteContentItem | null => {
      const canonicalUrl = tag(match[1], ["loc"]);
      const modifiedAt = tag(match[1], ["lastmod"]) || null;
      if (!canonicalUrl) return null;
      return { externalId: stableId(canonicalUrl), title: new URL(canonicalUrl).pathname.split("/").filter(Boolean).pop()?.replace(/[-_]+/g, " ") || new URL(canonicalUrl).hostname, content: null, excerpt: null, canonicalUrl, featuredImage: null, categories: [], tags: [], author: null, publishedAt: null, modifiedAt, status: "PUBLISHED", metadata: { source: "sitemap" } } satisfies WebsiteContentItem;
    }).filter((item): item is WebsiteContentItem => item !== null);
    return { items, nextCursor: items.map((item) => item.modifiedAt).filter(Boolean).sort().pop() ?? context.cursor ?? null };
  },
  publish: readOnlyPublish,
};

const webhookProvider: WebsiteProvider = {
  kind: "WEBHOOK",
  capabilities: { sync: false, publish: false, update: false, webhook: true, readOnly: true },
  async test() { return { ok: true, detail: "Webhook provider awaits signed inbound events", authStatus: "HMAC_CONFIGURED" }; },
  async sync() { throw new IntegrationError("WEBSITE", "UNSUPPORTED_PROVIDER", "Webhook connections receive content through signed events", 409, false, "Send a signed website webhook instead."); },
  publish: readOnlyPublish,
};

export function getWebsiteProvider(kind: CmsType): WebsiteProvider {
  if (kind === "WORDPRESS") return restProvider(kind, true);
  if (kind === "RSS") return rssProvider;
  if (kind === "SITEMAP" || kind === "STATIC") return { ...sitemapProvider, kind };
  if (kind === "WEBHOOK") return webhookProvider;
  if (["REST_API", "NEXTJS", "HEADLESS", "CUSTOM", "LARAVEL"].includes(kind)) return restProvider(kind);
  throw new IntegrationError("WEBSITE", "UNSUPPORTED_PROVIDER", `Website provider ${kind} is unsupported`, 400, false, "Select a supported website provider.");
}
