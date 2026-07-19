import { prisma } from "@/lib/db";
import { publishToPlatform, type PublishInput, type PublishPlatform, type PublishResult, type PublishTarget } from "./engine";
import { getQueue } from "./queue";
import { notifyPublish } from "@/lib/notifications";

/**
 * TASK-48 — Publishing coordinator.
 * Wires the DB models (Post, PostPlatform, PublishingJob, PublishingHistory,
 * Approval) to the real engine + queue. All decrypt/token work happens here,
 * server-side. Clients only see the resulting status/history.
 */

export interface CreatePostInput {
  title?: string;
  caption: string;
  hashtags?: string[];
  link?: string;
  cta?: string;
  location?: string;
  mediaUrls?: string[];
  platforms: { platform: PublishPlatform; accountId: string }[];
  providerOptions?: PublishInput["providerOptions"];
  scheduledAt?: string; // ISO; if absent -> publish now / queue now
  requiresApproval?: boolean;
  createdBy: { id: string; name: string };
}

export interface PostPublic {
  id: string;
  title?: string;
  caption: string;
  status: string;
  platforms: any[];
  createdAt: string;
}

function toPublic(post: any): PostPublic {
  return {
    id: post.id,
    title: post.title ?? undefined,
    caption: post.content ?? "",
    status: post.status,
    platforms: (post.platforms ?? []).map((p: any) => ({
      id: p.id,
      platform: p.platform,
      status: p.status,
      platformPostId: p.platformPostId ?? null,
      liveUrl: p.liveUrl ?? null,
      error: p.error ?? null,
      externalId: p.platformPostId ?? null,
      providerStatus: p.providerStatus ?? null,
      retryCount: p.retryCount ?? 0,
      maxRetries: p.maxRetries ?? 3,
      lastAttemptAt: p.lastAttemptAt?.toISOString?.() ?? null,
      nextRetryAt: p.nextRetryAt?.toISOString?.() ?? null,
      publishedAt: p.publishedAt?.toISOString?.() ?? null,
      providerMetadata: p.providerMetadata ?? null,
    })),
    createdAt: post.createdAt.toISOString(),
  };
}

/** Create a post (draft or scheduled) with per-platform rows. */
export async function createPost(input: CreatePostInput): Promise<PostPublic> {
  const post = await prisma.post.create({
    data: {
      title: input.title,
      content: input.caption,
      link: input.link ?? null,
      cta: input.cta ?? null,
      location: input.location ?? null,
      hashtags: input.hashtags ?? [],
      sourceMetadata: input.providerOptions ? ({ providerOptions: input.providerOptions } as any) : undefined,
      platform: (input.platforms[0]?.platform as any) ?? "FACEBOOK",
      status: input.scheduledAt ? "SCHEDULED" : "DRAFT",
      createdById: input.createdBy.id,
      platforms: {
        create: input.platforms.map((p) => ({
          platform: p.platform,
          accountId: p.accountId,
          status: "QUEUED",
        })),
      },
      media: input.mediaUrls?.length
        ? {
            create: input.mediaUrls.map((u, i) => ({
              type: /\.(mp4|mov|webm)$/i.test(u) ? "VIDEO" : "IMAGE",
              url: u,
              order: i,
            })),
          }
        : undefined,
    },
    include: { platforms: true },
  });
  return toPublic(post);
}

export async function updatePost(id: string, patch: Partial<CreatePostInput>): Promise<PostPublic> {
  const post = await prisma.post.update({
    where: { id },
    data: {
      title: patch.title,
      content: patch.caption,
      link: patch.link ?? null,
      hashtags: patch.hashtags,
      sourceMetadata: patch.providerOptions ? ({ providerOptions: patch.providerOptions } as any) : undefined,
    },
    include: { platforms: true },
  });
  return toPublic(post);
}

export async function deletePost(id: string): Promise<void> {
  await prisma.post.delete({ where: { id } });
}

/** Enqueue publishing (now or scheduled). Real execution happens via the worker. */
export async function enqueuePublish(postId: string, scheduledAt?: string): Promise<{ queued: boolean; jobId?: string }> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { platforms: true },
  });
  if (!post) throw new Error("Post not found");

  const runAt = scheduledAt ? new Date(scheduledAt) : new Date();
  const queue = getQueue();
  const jobId = await queue.enqueue(
    "publish:post",
    { postId, scheduledAt: runAt.toISOString() },
    { runAt },
  );

  await prisma.post.update({
    where: { id: postId },
    data: { status: scheduledAt ? "SCHEDULED" : "QUEUED" },
  });
  await prisma.$transaction(post.platforms.map((p) => prisma.postPlatform.update({
    where: { id: p.id },
    data: { status: p.status === "PUBLISHED" ? "PUBLISHED" : "QUEUED" },
  })));
  await prisma.publishingJob.createMany({
    data: post.platforms
      .filter((p) => p.status !== "PUBLISHED" && p.status !== "CANCELLED")
      .map((p) => ({ postId, platform: p.platform, accountId: p.accountId, state: "QUEUED" as const, scheduledFor: runAt, queueId: jobId, maxAttempts: p.maxRetries })),
  });
  return { queued: true, jobId };
}

function providerOptionsFrom(metadata: unknown): PublishInput["providerOptions"] {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return undefined;
  const options = (metadata as Record<string, unknown>).providerOptions;
  return options && typeof options === "object" && !Array.isArray(options)
    ? options as PublishInput["providerOptions"]
    : undefined;
}

function thrownResult(platform: string, error: unknown): PublishResult {
  return {
    platform,
    ok: false,
    error: error instanceof Error ? error.message : "Provider publishing failed",
    errorCode: "PROVIDER_EXCEPTION",
    retryable: true,
    providerStatus: "FAILED",
  };
}

/** Actually publish a post to all its platforms (called by the worker / or inline for instant). */
export async function executePublish(postId: string): Promise<{ results: any[] }> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { platforms: true, media: true },
  });
  if (!post) throw new Error("Post not found");

  const input: PublishInput = {
    title: post.title ?? undefined,
    caption: post.content ?? "",
    hashtags: post.hashtags,
    link: post.link ?? undefined,
    cta: post.cta ?? undefined,
    location: post.location ?? undefined,
    mediaUrls: post.media.map((m) => m.url),
    providerOptions: providerOptionsFrom(post.sourceMetadata),
  };

  const results: any[] = [];
  for (const p of post.platforms) {
    if (p.status !== "QUEUED") {
      results.push({ platform: p.platform, ok: p.status === "PUBLISHED", skipped: true, platformPostId: p.platformPostId, liveUrl: p.liveUrl });
      continue;
    }
    const target: PublishTarget = { platform: p.platform as PublishPlatform, accountId: p.accountId! };
    const startedAt = new Date();
    const claim = await prisma.postPlatform.updateMany({
      where: { id: p.id, status: "QUEUED" },
      data: { status: "PUBLISHING", lastAttemptAt: startedAt, nextRetryAt: null },
    });
    if (claim.count !== 1) {
      results.push({ platform: p.platform, ok: false, skipped: true, reason: "ALREADY_CLAIMED" });
      continue;
    }
    let job = await prisma.publishingJob.findFirst({
      where: { postId, platform: p.platform, state: { in: ["QUEUED", "RETRY"] } },
      orderBy: { createdAt: "desc" },
    });
    if (!job) {
      job = await prisma.publishingJob.create({ data: { postId, platform: p.platform, accountId: p.accountId, state: "QUEUED", maxAttempts: p.maxRetries } });
    }
    job = await prisma.publishingJob.update({
      where: { id: job.id },
      data: { state: "PROCESSING", startedAt, attempt: { increment: 1 }, lastError: null },
    });
    let r: PublishResult;
    try {
      r = await publishToPlatform(target, input);
    } catch (error) {
      r = thrownResult(p.platform, error);
    }
    const status = r.ok ? "PUBLISHED" : "FAILED";
    const retryCount = r.ok ? p.retryCount : p.retryCount + 1;
    const mayRetry = !r.ok && r.retryable !== false && retryCount < p.maxRetries;
    const nextRetryAt = mayRetry
      ? new Date(Date.now() + (r.retryAfterSeconds ?? Math.min(900, 30 * (2 ** Math.max(0, retryCount - 1)))) * 1000)
      : null;
    await prisma.postPlatform.update({
      where: { id: p.id },
      data: {
        status: status as any,
        platformPostId: r.platformPostId ?? null,
        liveUrl: r.liveUrl ?? null,
        error: r.error ?? null,
        providerStatus: r.providerStatus ?? (r.ok ? "PUBLISHED" : "FAILED"),
        providerMetadata: r.metadata ? (r.metadata as any) : undefined,
        retryCount,
        nextRetryAt,
        publishedAt: r.ok ? new Date() : null,
      },
    });
    await prisma.publishingJob.update({
      where: { id: job.id },
      data: {
        state: r.ok ? "PUBLISHED" : "FAILED",
        finishedAt: new Date(),
        lastError: r.error ?? null,
        resultPostId: r.platformPostId ?? null,
        resultUrl: r.liveUrl ?? null,
      },
    });
    if (mayRetry && nextRetryAt) {
      try {
        await getQueue().enqueue("publish:retry-due", { limit: 50 }, { runAt: nextRetryAt });
      } catch { /* The recurring retry sweep remains a fallback when queue insertion fails. */ }
    }
    // history
    await prisma.publishingHistory.create({
      data: {
        postId,
        platform: p.platform as any,
        accountId: p.accountId,
        status: status as any,
        postPlatformId: p.id,
        publishedBy: post.createdById,
        platformPostId: r.platformPostId ?? null,
        liveUrl: r.liveUrl ?? null,
        errorMessage: r.error ?? null,
        jobId: job.id,
      },
    });
    results.push({ platform: p.platform, ok: r.ok, platformPostId: r.platformPostId, liveUrl: r.liveUrl, error: r.error, errorCode: r.errorCode, providerStatus: r.providerStatus, retryable: mayRetry, nextRetryAt });
  }

  const finalPlatforms = await prisma.postPlatform.findMany({ where: { postId }, select: { status: true } });
  const allOk = finalPlatforms.length > 0 && finalPlatforms.every((row) => row.status === "PUBLISHED");
  const anyInProgress = finalPlatforms.some((row) => row.status === "QUEUED" || row.status === "PUBLISHING");
  await prisma.post.update({ where: { id: postId }, data: { status: allOk ? "PUBLISHED" : anyInProgress ? "QUEUED" : "FAILED", publishedAt: allOk ? new Date() : null } });

  // publish notification through the centralized engine
  try {
    await notifyPublish({
      userId: post.createdById,
      type: "PUBLISH",
      priority: allOk ? "MEDIUM" : "HIGH",
      title: allOk ? "Publishing Successful" : "Publishing Failed",
      body: allOk ? `"${post.title || "Post"}" published to ${results.length} platform(s).` : `"${post.title || "Post"}" failed on ${results.filter((r) => !r.ok).map((r) => r.platform).join(", ")}.`,
      entity: postId, entityType: "POST",
      platform: results[0]?.platform,
    });
  } catch {}

  return { results };
}

export async function listHistory(postId?: string): Promise<any[]> {
  const rows = await prisma.publishingHistory.findMany({
    where: postId ? { postId } : undefined,
    orderBy: { publishedAt: "desc" },
    take: 100,
  });
  return rows;
}

export async function getStatus(postId: string): Promise<PostPublic | null> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { platforms: true },
  });
  return post ? toPublic(post) : null;
}

/** Retry a failed post: re-enqueue and re-execute. */
export async function retryPost(postId: string): Promise<{ results: any[] }> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { platforms: true },
  });
  if (!post) throw new Error("Post not found");
  const failed = post.platforms.filter((p) => p.status === "FAILED" && p.retryCount < p.maxRetries);
  if (!failed.length) throw new Error("No failed providers are eligible for retry");
  let claimed = 0;
  for (const p of failed) {
    const didClaim = await prisma.$transaction(async (tx) => {
      const update = await tx.postPlatform.updateMany({ where: { id: p.id, status: "FAILED" }, data: { status: "QUEUED", error: null, nextRetryAt: null } });
      if (update.count !== 1) return false;
      await tx.publishingJob.create({ data: { postId, platform: p.platform, accountId: p.accountId, state: "RETRY", maxAttempts: p.maxRetries, scheduledFor: new Date() } });
      return true;
    });
    if (didClaim) claimed += 1;
  }
  if (!claimed) throw new Error("Failed providers are already being retried");
  return executePublish(postId);
}

/** Scheduler entry point: retry only providers whose isolated backoff has elapsed. */
export async function processDuePublishingRetries(limit = 50): Promise<{ posts: number; providers: number; results: any[] }> {
  const candidates = await prisma.postPlatform.findMany({
    where: { status: "FAILED", nextRetryAt: { lte: new Date() } },
    orderBy: { nextRetryAt: "asc" },
    take: Math.min(200, Math.max(1, limit)),
  });
  const eligible = candidates.filter((row) => row.retryCount < row.maxRetries);
  const due: typeof eligible = [];
  for (const row of eligible) {
    const claimed = await prisma.$transaction(async (tx) => {
      const update = await tx.postPlatform.updateMany({
        where: { id: row.id, status: "FAILED", nextRetryAt: { lte: new Date() } },
        data: { status: "QUEUED", error: null, nextRetryAt: null },
      });
      if (update.count !== 1) return false;
      await tx.publishingJob.create({ data: { postId: row.postId, platform: row.platform, accountId: row.accountId, state: "RETRY", maxAttempts: row.maxRetries, scheduledFor: new Date() } });
      return true;
    });
    if (claimed) due.push(row);
  }
  const grouped = new Map<string, typeof due>();
  for (const row of due) grouped.set(row.postId, [...(grouped.get(row.postId) ?? []), row]);
  const results: any[] = [];
  for (const duePostId of grouped.keys()) {
    try {
      results.push({ postId: duePostId, ...(await executePublish(duePostId)) });
    } catch (error) {
      results.push({ postId: duePostId, error: error instanceof Error ? error.message : "Retry execution failed" });
    }
  }
  return { posts: grouped.size, providers: due.length, results };
}

/** Manual approval decision. */
export async function decideApproval(
  postId: string,
  decision: "APPROVED" | "REJECTED",
  reviewer: { id: string; name: string },
  comment?: string,
): Promise<void> {
  await prisma.approval.upsert({
    where: { postId },
    create: {
      postId,
      status: decision,
      requestedBy: (await prisma.post.findUnique({ where: { id: postId } }))!.createdById,
      reviewedBy: reviewer.id,
      reviewedAt: new Date(),
      comment: comment ?? null,
    },
    update: { status: decision, reviewedBy: reviewer.id, reviewedAt: new Date(), comment: comment ?? null },
  });
  if (decision === "APPROVED") {
    await prisma.post.update({ where: { id: postId }, data: { status: "APPROVED" } });
  } else {
    await prisma.post.update({ where: { id: postId }, data: { status: "REJECTED" } });
  }
}
