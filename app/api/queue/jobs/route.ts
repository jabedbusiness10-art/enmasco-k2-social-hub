import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TASK-58.5 — Job audit records (real QueueJob rows from the durable audit
 * table). Used by the Queue → Jobs page. Pagination-friendly.
 */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });

  const take = Number(req.nextUrl.searchParams.get("take") ?? 50);
  const jobs = await prisma.queueJob.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.min(take, 200),
    select: {
      id: true,
      queue: true,
      name: true,
      status: true,
      priority: true,
      attempts: true,
      maxAttempts: true,
      progress: true,
      lastError: true,
      startedAt: true,
      finishedAt: true,
      createdAt: true,
      processingMs: true,
    },
  });

  return NextResponse.json({ jobs, total: jobs.length });
}
