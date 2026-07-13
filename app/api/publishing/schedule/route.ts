import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { enqueuePublish } from "@/services/publishing/service";

export const runtime = "nodejs";

/** TASK-48 — Schedule a post for later (real queue with runAt). */
export async function POST(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const postId = body?.postId;
  const scheduledAt = body?.scheduledAt;
  if (!postId || !scheduledAt) {
    return NextResponse.json({ error: "postId and scheduledAt required" }, { status: 400 });
  }
  try {
    const r = await enqueuePublish(postId, scheduledAt);
    return NextResponse.json({ queued: r.queued, jobId: r.jobId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Schedule failed" }, { status: 500 });
  }
}
