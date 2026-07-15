import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { notificationService } from "@/services/notification/notificationService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  const auth = await requirePermission("VIEW_NOTIFICATIONS", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id") || (await req.json().catch(() => ({}))).id;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await notificationService.remove(id, auth.user.id);
  return NextResponse.json({ ok: true });
}
