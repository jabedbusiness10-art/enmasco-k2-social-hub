import { prisma } from "@/lib/db";
import { IntegrationError } from "@/services/integrations/errors";
import { requireLinkedInAccount, markLinkedInOperationError } from "./account";
import { linkedinRequest, organizationUrn } from "./client";

export async function syncLinkedInPosts(accountId: string, options: { pages?: number; count?: number } = {}) {
  try {
    const { account, accessToken } = await requireLinkedInAccount(accountId, "readPosts");
    if (!account.connectedById) throw new IntegrationError("LINKEDIN", "AUTH_FAILED", "LinkedIn connection has no content owner", 409, true, "Reconnect the LinkedIn organization.");
    const pages = Math.min(5, Math.max(1, options.pages ?? 2));
    const count = Math.min(100, Math.max(1, options.count ?? 50));
    const remote: any[] = [];
    for (let page = 0; page < pages; page += 1) {
      const params = new URLSearchParams({ q: "author", author: organizationUrn(account.organizationId!), count: String(count), start: String(page * count), sortBy: "LAST_MODIFIED" });
      const { data } = await linkedinRequest<any>(`/posts?${params.toString()}`, accessToken);
      const elements = Array.isArray(data?.elements) ? data.elements : [];
      remote.push(...elements);
      if (elements.length < count) break;
    }
    let imported = 0;
    let updated = 0;
    for (const item of remote) {
      const externalId = String(item.id ?? "");
      if (!externalId) continue;
      const existing = await prisma.post.findUnique({ where: { sourceConnectionId_externalContentId: { sourceConnectionId: accountId, externalContentId: externalId } }, select: { id: true } });
      const createdAt = item.createdAt ? new Date(Number(item.createdAt)) : null;
      const modifiedAt = item.lastModifiedAt ? new Date(Number(item.lastModifiedAt)) : new Date();
      const status = String(item.lifecycleState ?? "PUBLISHED") === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
      await prisma.post.upsert({
        where: { sourceConnectionId_externalContentId: { sourceConnectionId: accountId, externalContentId: externalId } },
        create: {
          platform: "LINKEDIN",
          status,
          content: item.commentary ?? null,
          title: item.content?.article?.title ?? item.content?.media?.title ?? null,
          link: item.content?.article?.source ?? `https://www.linkedin.com/feed/update/${externalId}`,
          canonicalUrl: `https://www.linkedin.com/feed/update/${externalId}`,
          externalContentId: externalId,
          sourceConnectionId: accountId,
          sourceProvider: "LINKEDIN",
          sourceMetadata: { author: item.author, visibility: item.visibility, content: item.content ?? null, reactionCount: null, commentCount: null, shareCount: null } as any,
          lastExternalSyncAt: modifiedAt,
          publishedAt: createdAt,
          tags: [],
          createdById: account.connectedById,
          accountId,
        },
        update: {
          status,
          content: item.commentary ?? null,
          title: item.content?.article?.title ?? item.content?.media?.title ?? null,
          link: item.content?.article?.source ?? `https://www.linkedin.com/feed/update/${externalId}`,
          sourceMetadata: { author: item.author, visibility: item.visibility, content: item.content ?? null, reactionCount: null, commentCount: null, shareCount: null } as any,
          lastExternalSyncAt: modifiedAt,
        },
      });
      existing ? updated += 1 : imported += 1;
    }
    await prisma.companySocialAccount.update({ where: { id: accountId }, data: { lastSyncAt: new Date(), lastError: null } });
    return { imported, updated, count: remote.length, posts: remote.map((item) => ({ id: item.id, author: item.author, text: item.commentary ?? null, content: item.content ?? null, permalink: item.id ? `https://www.linkedin.com/feed/update/${item.id}` : null, createdAt: item.createdAt ?? null, lastModifiedAt: item.lastModifiedAt ?? null, status: item.lifecycleState ?? null, metrics: { reactions: null, comments: null, shares: null }, metricsAvailability: "NOT_REQUESTED" })) };
  } catch (error) {
    await markLinkedInOperationError(accountId, error);
    throw error;
  }
}

export type MetricAvailability = "AVAILABLE" | "NOT_AUTHORIZED" | "UNSUPPORTED" | "TEMPORARILY_UNAVAILABLE" | "NO_DATA";
export interface AvailableMetric { status: MetricAvailability; value: number | null; reason?: string }

function unavailable(error: unknown): AvailableMetric {
  if (error instanceof IntegrationError && (error.code === "PERMISSION_MISSING" || error.code === "ORGANIZATION_ACCESS_DENIED")) return { status: "NOT_AUTHORIZED", value: null, reason: error.recovery };
  if (error instanceof IntegrationError && (error.code === "RATE_LIMITED" || error.code === "NETWORK_ERROR" || error.code === "API_ERROR")) return { status: "TEMPORARILY_UNAVAILABLE", value: null, reason: error.recovery };
  return { status: "UNSUPPORTED", value: null, reason: "Metric is not available for this LinkedIn application product." };
}

function total(elements: any[], path: string[]): number | null {
  let found = false;
  const value = elements.reduce((sum, element) => {
    let current: any = element;
    for (const key of path) current = current?.[key];
    if (typeof current === "number") { found = true; return sum + current; }
    return sum;
  }, 0);
  return found ? value : null;
}

export async function getLinkedInAnalytics(accountId: string, range?: { start?: number; end?: number }) {
  const { account, accessToken } = await requireLinkedInAccount(accountId, "analytics");
  const org = organizationUrn(account.organizationId!);
  const interval = range?.start && range?.end ? `&timeIntervals=(timeRange:(start:${range.start},end:${range.end}),timeGranularityType:DAY)` : "";
  const metrics: Record<string, AvailableMetric> = {};

  try {
    const params = new URLSearchParams({ q: "organizationalEntity", organizationalEntity: org });
    const { data } = await linkedinRequest<any>(`/organizationalEntityFollowerStatistics?${params.toString()}${interval}`, accessToken);
    const elements = data?.elements ?? [];
    const organic = total(elements, ["followerCounts", "organicFollowerCount"]);
    const paid = total(elements, ["followerCounts", "paidFollowerCount"]);
    metrics.followers = organic == null && paid == null ? { status: "NO_DATA", value: null } : { status: "AVAILABLE", value: (organic ?? 0) + (paid ?? 0) };
    metrics.followerGrowth = metrics.followers;
  } catch (error) { metrics.followers = unavailable(error); metrics.followerGrowth = unavailable(error); }

  try {
    const params = new URLSearchParams({ q: "organizationalEntity", organizationalEntity: org });
    const { data } = await linkedinRequest<any>(`/organizationalEntityShareStatistics?${params.toString()}${interval}`, accessToken);
    const elements = data?.elements ?? [];
    const mappings: Record<string, string> = { impressions: "impressionCount", uniqueImpressions: "uniqueImpressionsCount", clicks: "clickCount", reactions: "likeCount", comments: "commentCount", shares: "shareCount", engagementRate: "engagement" };
    for (const [name, key] of Object.entries(mappings)) {
      const value = total(elements, ["totalShareStatistics", key]);
      metrics[name] = value == null ? { status: "NO_DATA", value: null } : { status: "AVAILABLE", value };
    }
  } catch (error) {
    for (const name of ["impressions", "uniqueImpressions", "clicks", "reactions", "comments", "shares", "engagementRate"]) metrics[name] = unavailable(error);
  }

  try {
    const params = new URLSearchParams({ q: "organization", organization: org });
    const { data } = await linkedinRequest<any>(`/organizationPageStatistics?${params.toString()}${interval}`, accessToken);
    const value = total(data?.elements ?? [], ["totalPageStatistics", "views", "allPageViews", "pageViews"]);
    metrics.pageViews = value == null ? { status: "NO_DATA", value: null } : { status: "AVAILABLE", value };
  } catch (error) { metrics.pageViews = unavailable(error); }

  return { accountId, organizationId: account.organizationId, range: range ?? null, metrics, generatedAt: new Date().toISOString() };
}
