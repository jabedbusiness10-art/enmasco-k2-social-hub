import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TASK-58.5 — Worker registry + latest heartbeats (real QueueWorker /
 * WorkerHeartbeat rows). Empty when no workers have run yet (DB fallback).
 */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });

  const workers = await prisma.queueWorker.findMany({
    orderBy: { startedAt: "desc" },
    take: 50,
  });
  const heartbeats = await prisma.workerHeartbeat.findMany({
    orderBy: { timestamp: "desc" },
    take: 50,
    select: { workerId: true, queue: true, status: true, cpu: true, memoryMb: true, timestamp: true },
  });

  return NextResponse.json({ workers, heartbeats, total: workers.length });
}
