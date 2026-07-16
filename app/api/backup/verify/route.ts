import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { verifyBackup } from "@/lib/backup/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/backup/verify?backupJobId=...  -> runs verification
export async function POST(req: NextRequest) {
  const perm = await requirePermission("MANAGE_USERS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("backupJobId") || (await req.json().catch(() => ({}))).backupJobId;
  if (!id) return NextResponse.json({ error: "backupJobId required" }, { status: 400 });
  const result = await verifyBackup(id);
  return NextResponse.json({ status: result });
}
