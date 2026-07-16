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
  const endpoint = sp.get("endpoint");
  const where: any = {};
  if (endpoint) where.endpoint = { contains: endpoint };
  const [rows, total] = await Promise.all([
    prisma.apiAccessLog.findMany({ where, orderBy: { createdAt: "desc" }, take, skip }),
    prisma.apiAccessLog.count({ where }),
  ]);
  await logApiAccess(req, 200, undefined, perm.user!.id, perm.user!.email);
  return NextResponse.json({ rows, total });
}
