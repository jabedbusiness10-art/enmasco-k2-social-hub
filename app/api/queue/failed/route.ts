import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TASK-57 — Failed jobs list (from the durable FailedJob audit table).
 * Returns real records; empty when none. No fabricated entries.
 */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });

  const jobs = await prisma.failedJob.findMany({
    orderBy: { failedAt: "desc" },
    take: 50,
    select: {
      id: true,
      queue: true,
      name: true,
      jobId: true,
      error: true,
      attempts: true,
      failedAt: true,
      recoveredAt: true,
    },
  });

  const recovered = await prisma.queueJob.count({ where: { status: "FAILED" } }).catch(() => 0);

  return NextResponse.json({ jobs, recoveredCount: recovered });
}
