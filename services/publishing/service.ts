import { prisma } from "@/lib/db";
import { publishToPlatform, type PublishInput, type PublishTarget } from "./engine";
import { getQueue, QUEUE_NAME } from "./queue";

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
  platforms: { platform: "FACEBOOK" | "INSTAGRAM" | "LINKEDIN"; accountId: string }[];
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
    QUEUE_NAME,
    { postId, scheduledAt: runAt.toISOString() },
    { runAt },
  );

  await prisma.post.update({
    where: { id: postId },
    data: { status: scheduledAt ? "SCHEDULED" : "QUEUED" },
  });
  for (const p of post.platforms) {
    await prisma.postPlatform.update({ where: { id: p.id }, data: { status: "QUEUED" } });
  }
  return { queued: true, jobId };
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
  };

  const results: any[] = [];
  for (const p of post.platforms) {
    const target: PublishTarget = { platform: p.platform as any, accountId: p.accountId! };
    // mark publishing
    await prisma.postPlatform.update({ where: { id: p.id }, data: { status: "PUBLISHING" } });
    const r = await publishToPlatform(target, input);
    const status = r.ok ? "PUBLISHED" : "FAILED";
    await prisma.postPlatform.update({
      where: { id: p.id },
      data: { status: status as any, platformPostId: r.platformPostId ?? null, liveUrl: r.liveUrl ?? null, error: r.error ?? null },
    });
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
      },
    });
    results.push({ platform: p.platform, ok: r.ok, platformPostId: r.platformPostId, liveUrl: r.liveUrl, error: r.error });
  }

  const allOk = results.every((r) => r.ok);
  await prisma.post.update({ where: { id: postId }, data: { status: allOk ? "PUBLISHED" : "FAILED", publishedAt: new Date() } });
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
  // reset failed platforms to QUEUED
  for (const p of post.platforms) {
    if (p.status === "FAILED") {
      await prisma.postPlatform.update({ where: { id: p.id }, data: { status: "QUEUED", error: null } });
    }
  }
  return executePublish(postId);
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
