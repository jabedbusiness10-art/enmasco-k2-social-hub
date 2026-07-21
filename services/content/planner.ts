import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/security/audit";
import type { Platform } from "@prisma/client";
import type { PlanningActivity } from "@/types/contentPlanner";

// TASK-75 — Company Content Planner service.
// Reuses the existing Post model as the single content source (no duplicate
// model). Campaign linking via Post.campaignId; approvals via Approval;
// activity via AuditLog. All reads/writes are real DB operations.

export type ContentWorkflow =
  | "IDEA"
  | "DRAFT"
  | "REVIEW"
  | "APPROVED"
  | "SCHEDULED"
  | "PUBLISHED"
  | "ARCHIVED";

export type ContentPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface ContentPlanInput {
  title: string;
  caption?: string;
  platform: Platform;
  workflowStatus?: ContentWorkflow;
  status?: string; // PostStatus
  category?: string;
  priority?: ContentPriority;
  assigneeId?: string | null;
  campaignId?: string | null;
  creatorId: string;
  labels?: string[];
  hashtags?: string[];
  notes?: string;
  targetAudience?: string;
  goal?: string;
  scheduledAt?: string | null;
  mediaUrls?: string[];
}

const CONTENT_INCLUDE = {
  campaign: true,
  creator: { select: { id: true, name: true, email: true } },
  assignee: { select: { id: true, name: true, email: true } },
  approvals: true,
  scheduled: true,
  platforms: true,
  media: true,
} as const;

function mapRow(row: any) {
  return {
    id: row.id,
    title: row.title ?? "(untitled)",
    caption: row.content ?? row.caption ?? "",
    platform: row.platform,
    status: row.status,
    workflowStatus: (row.workflowStatus as ContentWorkflow) ?? "DRAFT",
    category: row.category ?? null,
    priority: (row.priority as ContentPriority) ?? "MEDIUM",
    assigneeId: row.assigneeId ?? null,
    creatorId: row.createdById,
    campaignId: row.campaignId ?? null,
    labels: row.labels ?? [],
    hashtags: row.hashtags ?? [],
    notes: row.notes ?? null,
    targetAudience: row.targetAudience ?? null,
    goal: row.goal ?? null,
    contentVersion: row.contentVersion ?? 1,
    scheduledAt: row.scheduled?.scheduledAt?.toISOString?.() ?? row.publishedAt?.toISOString?.() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    archivedAt: row.archivedAt?.toISOString?.() ?? null,
    creator: row.creator,
    assignee: row.assignee ?? null,
    campaign: row.campaign ? { id: row.campaign.id, title: row.campaign.title } : null,
    approval: row.approvals?.[0]
      ? {
          status: row.approvals[0].status,
          requestedBy: row.approvals[0].requestedBy,
          reviewedBy: row.approvals[0].reviewedBy ?? null,
          comment: row.approvals[0].comment ?? null,
          reviewedAt: row.approvals[0].reviewedAt?.toISOString?.() ?? null,
        }
      : { status: "NOT_REQUIRED" },
  };
}

export async function listContentPlans(filters: {
  platform?: Platform | "all";
  workflowStatus?: ContentWorkflow | "all";
  campaignId?: string | "all";
  creatorId?: string | "all";
  search?: string;
  from?: string;
  to?: string;
  includeArchived?: boolean;
} = {}): Promise<any[]> {
  const where: any = {};
  if (filters.platform && filters.platform !== "all") where.platform = filters.platform;
  if (filters.workflowStatus && filters.workflowStatus !== "all") where.workflowStatus = filters.workflowStatus;
  if (filters.campaignId && filters.campaignId !== "all") where.campaignId = filters.campaignId;
  if (filters.creatorId && filters.creatorId !== "all") where.createdById = filters.creatorId;
  if (!filters.includeArchived) where.archivedAt = null;
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { content: { contains: filters.search, mode: "insensitive" } },
      { caption: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters.from || filters.to) {
    where.scheduled = {
      scheduledAt: {
        ...(filters.from ? { gte: new Date(filters.from) } : {}),
        ...(filters.to ? { lte: new Date(filters.to + "T23:59:59") } : {}),
      },
    };
  }
  const rows = await prisma.post.findMany({
    where,
    include: CONTENT_INCLUDE,
    orderBy: [{ updatedAt: "desc" }],
    take: 500,
  });
  return rows.map(mapRow);
}

export async function getContentPlan(id: string): Promise<any | null> {
  const row = await prisma.post.findUnique({ where: { id }, include: CONTENT_INCLUDE });
  return row ? mapRow(row) : null;
}

export async function createContentPlan(input: ContentPlanInput, actor: { id: string; name: string }): Promise<any> {
  const post = await prisma.post.create({
    data: {
      title: input.title,
      content: input.caption ?? "",
      platform: input.platform,
      status: (input.status ?? "DRAFT") as any,
      workflowStatus: input.workflowStatus ?? "DRAFT",
      category: input.category ?? null,
      priority: input.priority ?? "MEDIUM",
      assigneeId: input.assigneeId ?? null,
      campaignId: input.campaignId ?? null,
      createdById: input.creatorId,
      labels: input.labels ?? [],
      hashtags: input.hashtags ?? [],
      notes: input.notes ?? null,
      targetAudience: input.targetAudience ?? null,
      goal: input.goal ?? null,
      media: input.mediaUrls?.length
        ? { create: input.mediaUrls.map((u, i) => ({ type: /\.(mp4|mov|webm)$/i.test(u) ? "VIDEO" : "IMAGE", url: u, order: i })) }
        : undefined,
      scheduled: input.scheduledAt ? { create: { scheduledAt: new Date(input.scheduledAt), status: "SCHEDULED" } } : undefined,
    },
    include: CONTENT_INCLUDE,
  });
  await writeAudit({ action: "CONTENT_CREATE", entityName: "Post", entityId: post.id, createdById: actor.id, module: "SOCIAL", metadata: { title: input.title, platform: input.platform } }).catch(() => {});
  return mapRow(post);
}

export async function updateContentPlan(id: string, input: Partial<ContentPlanInput>, actor: { id: string; name: string }): Promise<any> {
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) throw new Error("Content not found");
  const nextVersion = (existing.contentVersion ?? 1) + 1;
  const post = await prisma.post.update({
    where: { id },
    data: {
      title: input.title ?? existing.title,
      content: input.caption ?? existing.content,
      platform: input.platform ?? existing.platform,
      workflowStatus: input.workflowStatus ?? existing.workflowStatus,
      status: (input.status ?? existing.status) as any,
      category: input.category !== undefined ? input.category : existing.category,
      priority: input.priority ?? existing.priority,
      assigneeId: input.assigneeId !== undefined ? input.assigneeId : existing.assigneeId,
      campaignId: input.campaignId !== undefined ? input.campaignId : existing.campaignId,
      labels: input.labels ?? existing.labels,
      hashtags: input.hashtags ?? existing.hashtags,
      notes: input.notes !== undefined ? input.notes : existing.notes,
      targetAudience: input.targetAudience !== undefined ? input.targetAudience : existing.targetAudience,
      goal: input.goal !== undefined ? input.goal : existing.goal,
      contentVersion: nextVersion,
      archivedAt: input.workflowStatus === "ARCHIVED" ? new Date() : existing.archivedAt,
      scheduled: input.scheduledAt
        ? { upsert: { create: { scheduledAt: new Date(input.scheduledAt), status: "SCHEDULED" }, update: { scheduledAt: new Date(input.scheduledAt) } } }
        : undefined,
    },
    include: CONTENT_INCLUDE,
  });
  await writeAudit({ action: "CONTENT_UPDATE", entityName: "Post", entityId: id, createdById: actor.id, module: "SOCIAL", metadata: { version: nextVersion } }).catch(() => {});
  return mapRow(post);
}

export async function deleteContentPlan(id: string, actor: { id: string; name: string }): Promise<void> {
  // Existence check BEFORE delete — a missing/deleted record must surface a
  // clean 404, never a swallowed Prisma P2025.
  const existing = await prisma.post.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    const err = new Error("Post not found") as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  await prisma.post.delete({ where: { id } });
  await writeAudit({ action: "CONTENT_DELETE", entityName: "Post", entityId: id, createdById: actor.id, module: "SOCIAL" }).catch(() => {});
}

export async function duplicateContentPlan(id: string, actor: { id: string; name: string }): Promise<any> {
  const src = await prisma.post.findUnique({ where: { id }, include: { media: true } });
  if (!src) throw new Error("Content not found");
  const copy = await prisma.post.create({
    data: {
      title: `${src.title ?? "Untitled"} (copy)`,
      content: src.content ?? "",
      platform: src.platform,
      status: "DRAFT",
      workflowStatus: "DRAFT",
      category: src.category,
      priority: src.priority,
      assigneeId: src.assigneeId,
      campaignId: src.campaignId,
      createdById: actor.id,
      labels: src.labels,
      hashtags: src.hashtags,
      notes: src.notes,
      targetAudience: src.targetAudience,
      goal: src.goal,
      media: src.media?.length ? { create: src.media.map((m: any, i: number) => ({ type: m.type, url: m.url, order: i })) } : undefined,
    },
    include: CONTENT_INCLUDE,
  });
  await writeAudit({ action: "CONTENT_DUPLICATE", entityName: "Post", entityId: copy.id, createdById: actor.id, module: "SOCIAL" }).catch(() => {});
  return mapRow(copy);
}

export async function setApproval(
  id: string,
  decision: "APPROVED" | "REJECTED",
  reviewer: { id: string; name: string },
  comment?: string,
): Promise<any> {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw new Error("Content not found");
  await prisma.approval.upsert({
    where: { postId: id },
    create: { postId: id, status: decision, requestedBy: post.createdById, reviewedBy: reviewer.id, comment: comment ?? null, reviewedAt: new Date() },
    update: { status: decision, reviewedBy: reviewer.id, comment: comment ?? null, reviewedAt: new Date() },
  });
  // Reflect approval into Post status
  await prisma.post.update({
    where: { id },
    data: { status: decision === "APPROVED" ? "APPROVED" : "REJECTED", workflowStatus: decision === "APPROVED" ? "APPROVED" : "REVIEW" },
  });
  await writeAudit({ action: decision === "APPROVED" ? "CONTENT_APPROVE" : "CONTENT_REJECT", entityName: "Post", entityId: id, createdById: reviewer.id, module: "SOCIAL", metadata: { comment } }).catch(() => {});
  return getContentPlan(id);
}

const AUDIT_TO_EVENT: Record<string, PlanningActivity["type"]> = {
  CONTENT_CREATE: "CREATED",
  CONTENT_UPDATE: "EDITED",
  CONTENT_DELETE: "FAILED",
  CONTENT_DUPLICATE: "CREATED",
  CONTENT_APPROVE: "APPROVED",
  CONTENT_REJECT: "REJECTED",
  CONTENT_SCHEDULE: "SCHEDULED",
  CONTENT_PUBLISH: "PUBLISHED",
  CONTENT_CANCEL: "FAILED",
  CONTENT_ASSIGN: "APPROVED",
  CONTENT_ARCHIVE: "FAILED",
};

function mapAuditAction(action: string): PlanningActivity["type"] {
  const key = String(action ?? "").trim().toUpperCase();
  return (
    AUDIT_TO_EVENT[key] ??
    (key.endsWith("CREATE")
      ? "CREATED"
      : key.endsWith("UPDATE") || key.endsWith("EDIT")
        ? "EDITED"
        : key.endsWith("DELETE") || key.endsWith("ARCHIVE")
          ? "FAILED"
          : key.endsWith("APPROVE")
            ? "APPROVED"
            : key.endsWith("REJECT")
              ? "REJECTED"
              : key.endsWith("SCHEDULE")
                ? "SCHEDULED"
                : key.endsWith("PUBLISH")
                  ? "PUBLISHED"
                  : key.endsWith("CANCEL")
                    ? "FAILED"
                    : key.endsWith("ASSIGN")
                      ? "APPROVED"
                      : key.endsWith("COMMENT") || key.endsWith("NOTE")
                        ? "COMMENT"
                        : "FAILED")
  );
}

export async function contentActivity(postId: string): Promise<PlanningActivity[]> {
  const logs = await prisma.auditLog.findMany({
    where: { entityId: postId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return logs.map((l: any) => ({
    id: l.id,
    type: mapAuditAction(l.action),
    contentId: postId,
    contentTitle: (l.metadata as any)?.title ?? (l.metadata as any)?.platform ?? undefined,
    actorName: l.userId ?? "Team",
    at: l.createdAt.toISOString(),
    detail: l.action,
  }));
}

/** Real reference data for planner filters/selects (campaigns, users, departments). */
export async function listReferenceData(): Promise<{ campaigns: any[]; users: any[]; departments: any[] }> {
  const [campaigns, users, departments] = await Promise.all([
    prisma.campaign.findMany({ orderBy: { title: "asc" }, take: 200 }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, roleId: true, departmentId: true },
      orderBy: { name: "asc" },
      take: 500,
    }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);
  return {
    campaigns: campaigns.map((c: any) => ({ id: c.id, title: c.title, status: c.status ?? "ACTIVE", startDate: c.startDate?.toISOString?.() ?? null, endDate: c.endDate?.toISOString?.() ?? null })),
    users: users.map((u: any) => ({ id: u.id, name: u.name, email: u.email })),
    departments: departments.map((d: any) => ({ id: d.id, name: d.name })),
  };
}
