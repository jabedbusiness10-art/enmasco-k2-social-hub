import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { notificationService } from "@/services/notification/notificationService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requirePermission("VIEW_NOTIFICATIONS", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const { items, total, unread } = await notificationService.list(auth.user.id, {
    category: sp.get("category") || undefined,
    type: sp.get("type") || undefined,
    priority: sp.get("priority") || undefined,
    module: sp.get("module") || undefined,
    platform: sp.get("platform") || undefined,
    unreadOnly: sp.get("unread") === "1",
    archivedOnly: sp.get("archived") === "1",
    search: sp.get("search")?.trim() || undefined,
    skip: Number(sp.get("skip") || 0),
    take: Number(sp.get("take") || 30),
  });
  return NextResponse.json({ items, total, unread });
}
