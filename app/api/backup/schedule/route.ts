import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const perm = await requirePermission("MANAGE_USERS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const rows = await prisma.backupSchedule.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ rows });
}

export async function POST(req: NextRequest) {
  const perm = await requirePermission("MANAGE_USERS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const schedule = await prisma.backupSchedule.create({
    data: {
      name: body.name || `${body.type} schedule`,
      type: body.type || "DATABASE",
      frequency: body.frequency || "DAILY",
      cron: body.cron || null,
      enabled: body.enabled ?? true,
      paused: body.paused ?? false,
      retentionCount: body.retentionCount ?? 7,
      createdById: perm.user!.id,
      nextRunAt: body.nextRunAt ? new Date(body.nextRunAt) : new Date(Date.now() + 24 * 3600 * 1000),
    },
  });
  return NextResponse.json({ id: schedule.id, status: 201 });
}

export async function PATCH(req: NextRequest) {
  const perm = await requirePermission("MANAGE_USERS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.backupSchedule.update({ where: { id }, data: { enabled: body.enabled, paused: body.paused, frequency: body.frequency, cron: body.cron, retentionCount: body.retentionCount } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
