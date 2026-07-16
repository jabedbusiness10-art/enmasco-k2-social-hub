import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { createBackupJob, type BackupType } from "@/lib/backup/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const perm = await requirePermission("MANAGE_USERS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const type = (body.type as BackupType) || "DATABASE";
  const name = body.name || `${type} backup ${new Date().toISOString().slice(0, 10)}`;
  const res = await createBackupJob({
    name, type, mode: body.mode ?? "MANUAL", storageProvider: body.storageProvider ?? "LOCAL",
    createdById: perm.user!.id,
  });
  return NextResponse.json({ id: res.id, queued: res.queued, status: 201 });
}
