import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { enqueuePublish, executePublish } from "@/services/publishing/service";
import { processDueJobs } from "@/lib/publishing-worker";

export const runtime = "nodejs";

/**
 * TASK-48 — Publish now. Enqueues to the publishing queue and runs the worker
 * synchronously so the result is returned (real platform calls). Scheduled
 * publishing uses /api/publishing/schedule instead.
 */
export async function POST(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: 401 });
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const postId = body?.postId;
  if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 });
  try {
    await enqueuePublish(postId);
    const { results } = await executePublish(postId);
    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Publish failed" }, { status: 500 });
  }
}

/** Admin/manual queue drainer (used by the worker poller + cron). */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: 401 });
  const r = await processDueJobs();
  return NextResponse.json(r);
}
