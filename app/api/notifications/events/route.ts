import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { notificationService } from "@/services/notification/notificationService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requirePermission("VIEW_NOTIFICATIONS", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const events = await notificationService.events({
    module: sp.get("module") || undefined,
    type: sp.get("type") || undefined,
    take: Number(sp.get("take") || 50),
  });
  const systemEvents = await notificationService.systemEvents(Number(sp.get("take") || 50));
  return NextResponse.json({ events, systemEvents });
}
