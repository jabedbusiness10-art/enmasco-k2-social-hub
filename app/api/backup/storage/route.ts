import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { getStorageStatus } from "@/lib/backup/recovery";
import { applyRetention } from "@/lib/backup/recovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const perm = await requirePermission("MANAGE_USERS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const storage = await getStorageStatus();
  return NextResponse.json({ storage });
}

// POST triggers retention cleanup (admin only).
export async function POST(req: NextRequest) {
  const perm = await requirePermission("MANAGE_USERS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  await applyRetention(body.keepLast ?? 7);
  return NextResponse.json({ ok: true });
}
