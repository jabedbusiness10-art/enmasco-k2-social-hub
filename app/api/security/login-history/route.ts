import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { logApiAccess } from "@/lib/security/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const perm = await requirePermission("MANAGE_USERS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const take = Math.min(Number(sp.get("take") ?? 50), 200);
  const skip = Number(sp.get("skip") ?? 0);
  const result = sp.get("result");
  const where: any = {};
  if (result) where.result = result;
  const [rows, total] = await Promise.all([
    prisma.loginHistory.findMany({ where, orderBy: { createdAt: "desc" }, take, skip, include: { user: { select: { name: true, email: true, role: true } } } }),
    prisma.loginHistory.count({ where }),
  ]);
  await logApiAccess(req, 200, undefined, perm.user!.id, perm.user!.email);
  return NextResponse.json({ rows, total });
}
