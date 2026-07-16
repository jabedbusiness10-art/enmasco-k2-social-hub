import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { getBackupOverview } from "@/lib/backup/recovery";
import { getStorageStatus } from "@/lib/backup/recovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const perm = await requirePermission("MANAGE_USERS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const [overview, storage] = await Promise.all([getBackupOverview(), getStorageStatus()]);
  return NextResponse.json({ overview, storage });
}
