import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const perm = await requirePermission("MANAGE_USERS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const take = Math.min(Number(sp.get("take") ?? 50), 200);
  const skip = Number(sp.get("skip") ?? 0);
  const type = sp.get("type");
  const where: any = {};
  if (type) where.type = type;
  const [rows, total] = await Promise.all([
    prisma.recoveryLog.findMany({ where, orderBy: { createdAt: "desc" }, take, skip }),
    prisma.recoveryLog.count({ where }),
  ]);
  return NextResponse.json({ rows, total });
}
