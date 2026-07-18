import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { logApiAccess } from "@/lib/security/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// USERS → Activity. Real per-user behavioural + security data, NOT team ops:
// Login History, User Actions (audit log), Password Changes (audit filtered),
// API Usage (api connections), Device History (trusted devices),
// Last Seen (presence), Security Events.
export async function GET(req: NextRequest) {
  const perm = await requirePermission("MANAGE_USERS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const take = Math.min(Number(sp.get("take") ?? 50), 200);

  const [logins, actions, passwordChanges, apiUsage, devices, presence, securityEvents] = await Promise.all([
    prisma.loginHistory.findMany({ orderBy: { createdAt: "desc" }, take, include: { user: { select: { name: true, email: true } } } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take,
      where: { actionType: { not: "LOGIN" } },
      include: { createdBy: { select: { name: true, email: true, role: true } } },
    }),
    prisma.auditLog.findMany({ where: { action: { contains: "PASSWORD", mode: "insensitive" } }, orderBy: { createdAt: "desc" }, take, include: { createdBy: { select: { name: true, email: true } } } }),
    prisma.apiConnection.findMany({ orderBy: { createdAt: "desc" }, take, include: { user: { select: { name: true, email: true } } } }),
    prisma.trustedDevice.findMany({ orderBy: { lastUsedAt: "desc" }, take, include: { user: { select: { name: true, email: true } } } }),
    prisma.onlinePresence.findMany({ orderBy: { lastSeen: "desc" }, include: { user: { select: { name: true, email: true, status: true } } } }),
    prisma.securityEvent.findMany({ orderBy: { createdAt: "desc" }, take }),
  ]);

  await logApiAccess(req, 200, undefined, perm.user!.id, perm.user!.email);
  return NextResponse.json({ logins, actions, passwordChanges, apiUsage, devices, presence, securityEvents });
}
