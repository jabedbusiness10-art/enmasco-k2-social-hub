import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { createPost } from "@/services/publishing/service";
import { PUBLISH_PLATFORMS } from "@/services/publishing/engine";
import { z } from "zod";

export const runtime = "nodejs";

const createPostSchema = z.object({
  title: z.string().trim().max(100).optional(),
  caption: z.string().trim().min(1).max(5_000),
  hashtags: z.array(z.string().trim().min(1).max(100)).max(30).optional(),
  link: z.string().url().optional(),
  cta: z.string().trim().max(100).optional(),
  location: z.string().trim().max(200).optional(),
  mediaUrls: z.array(z.string().url()).max(10).optional(),
  platforms: z.array(z.object({
    platform: z.enum(PUBLISH_PLATFORMS),
    accountId: z.string().trim().min(1),
  })).min(1).superRefine((targets, context) => {
    const seen = new Set<string>();
    targets.forEach((target, index) => {
      if (seen.has(target.platform)) context.addIssue({ code: z.ZodIssueCode.custom, message: `${target.platform} can only be selected once`, path: [index, "platform"] });
      seen.add(target.platform);
    });
  }),
  scheduledAt: z.string().datetime().optional(),
  requiresApproval: z.boolean().optional(),
  providerOptions: z.object({
    tiktok: z.object({
      privacyLevel: z.string().max(80).optional(),
      disableComment: z.boolean().optional(),
      disableDuet: z.boolean().optional(),
      disableStitch: z.boolean().optional(),
      coverTimestampMs: z.number().int().min(0).optional(),
    }).optional(),
    youtube: z.object({
      title: z.string().max(100).optional(),
      description: z.string().max(5_000).optional(),
      thumbnailUrl: z.string().url().optional(),
      tags: z.array(z.string().max(500)).max(50).optional(),
      playlistId: z.string().max(100).optional(),
      visibility: z.enum(["public", "private", "unlisted"]).optional(),
      publishAt: z.string().datetime().optional(),
      categoryId: z.string().regex(/^\d+$/).optional(),
      madeForKids: z.boolean().optional(),
    }).optional(),
    website: z.object({ status: z.enum(["draft", "publish"]).optional() }).optional(),
  }).optional(),
});

/** TASK-48 — Create a post (draft / scheduled). */
export async function POST(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: 401 });
  const user = perm.user!;
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid publishing request", issues: parsed.error.flatten() }, { status: 400 });
  try {
    const post = await createPost({
      ...parsed.data,
      createdBy: { id: user.id, name: user.name },
    });
    return NextResponse.json({ post }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Create failed" }, { status: 500 });
  }
}

/** List posts. */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: 401 });
  const { prisma } = await import("@/lib/db");
  const posts = await prisma.post.findMany({
    include: { platforms: true, media: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ posts });
}
