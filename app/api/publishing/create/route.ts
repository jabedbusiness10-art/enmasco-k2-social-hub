import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { createPost } from "@/services/publishing/service";
import { logger } from "@/lib/logger";
import {
  createPostSchema,
  normalizeCreatePostPayload,
  resolvePublishingTargets,
  summarizePublishingValidationIssues,
} from "./contract";

export const runtime = "nodejs";

function safeDiagnostics(req: NextRequest, body: any, parsedFieldNames: string[] = []) {
  const platforms = Array.isArray(body?.platforms) ? body.platforms : [];
  const scheduledAt = typeof body?.scheduledAt === "string" ? body.scheduledAt : "";
  const scheduledDate = scheduledAt ? new Date(scheduledAt) : null;
  return {
    contentType: req.headers.get("content-type") ?? "missing",
    topLevelFieldNames: body && typeof body === "object" && !Array.isArray(body) ? Object.keys(body).sort() : [],
    platformValues: platforms.map((item: any) => item?.platform).filter(Boolean),
    accountIdPresent: platforms.map((item: any) => Boolean(item?.accountId?.trim?.())),
    captionLength: typeof body?.caption === "string" ? body.caption.trim().length : 0,
    mediaCount: Array.isArray(body?.mediaUrls) ? body.mediaUrls.length : 0,
    mediaTypes: Array.isArray(body?.mediaUrls)
      ? body.mediaUrls.map((url: unknown) => typeof url === "string" && /\.(mp4|mov|webm)(?:\?|$)/i.test(url) ? "VIDEO" : "IMAGE_OR_OTHER")
      : [],
    publishMode: scheduledAt ? "scheduled" : "immediate",
    scheduledAtPresent: Boolean(scheduledAt),
    scheduledAtIsoValid: scheduledDate ? !Number.isNaN(scheduledDate.getTime()) : false,
    timezone: typeof body?.timezone === "string" ? body.timezone : "missing",
    validationErrorFieldNames: parsedFieldNames,
  };
}

/** TASK-48 — Create a post (draft / scheduled). */
export async function POST(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: 401 });
  const user = perm.user!;
  let body: any;
  try {
    body = normalizeCreatePostPayload(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    const summary = summarizePublishingValidationIssues(parsed.error);
    logger.warn("publishing", "Publishing create validation failed", safeDiagnostics(req, body, summary.fieldNames));
    return NextResponse.json({ error: summary.message, issues: summary.issues }, { status: 400 });
  }
  try {
    const { prisma } = await import("@/lib/db");
    const accounts = await prisma.companySocialAccount.findMany({
      select: { id: true, platform: true, status: true, isActive: true },
    });
    const resolved = resolvePublishingTargets(parsed.data, accounts);
    logger.info("publishing", "Publishing create request accepted", safeDiagnostics(req, resolved));
    const post = await createPost({
      ...resolved,
      createdBy: { id: user.id, name: user.name },
    });
    return NextResponse.json({ post }, { status: 201 });
  } catch (e: any) {
    const message = e?.message ?? "Create failed";
    const status = /connected|platform/i.test(message) ? 400 : 500;
    logger.warn("publishing", "Publishing create request rejected", {
      ...safeDiagnostics(req, parsed.data),
      validationErrorFieldNames: [/connected/i.test(message) ? "platforms" : "request"],
    });
    return NextResponse.json({ error: message }, { status });
  }
}

/** List posts. */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: 401 });
  const { prisma } = await import("@/lib/db");
  const posts = await prisma.post.findMany({
    include: { platforms: true, media: true, scheduled: true, creator: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ posts });
}
