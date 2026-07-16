import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { createRestoreJob } from "@/lib/backup/recovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const perm = await requirePermission("MANAGE_USERS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.backupJobId) return NextResponse.json({ error: "backupJobId required" }, { status: 400 });
  const scope = body.scope || "EVERYTHING";
  const res = await createRestoreJob(body.backupJobId, scope, perm.user!.id);
  return NextResponse.json({ id: res.id, queued: res.queued, status: 201 });
}
