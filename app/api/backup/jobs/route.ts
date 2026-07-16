import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const perm = await requirePermission("MANAGE_USERS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const take = Math.min(Number(sp.get("take") ?? 30), 200);
  const skip = Number(sp.get("skip") ?? 0);
  const status = sp.get("status");
  const where: any = {};
  if (status) where.status = status;
  const [rows, total] = await Promise.all([
    prisma.backupJob.findMany({ where, orderBy: { createdAt: "desc" }, take, skip, include: { schedule: { select: { name: true } } } }),
    prisma.backupJob.count({ where }),
  ]);
  return NextResponse.json({ rows, total });
}
