import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { notificationService } from "@/services/notification/notificationService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requirePermission("VIEW_NOTIFICATIONS", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const { items } = await notificationService.list(auth.user.id, {
    search: sp.get("q")?.trim() || undefined,
    category: sp.get("category") || undefined,
    priority: sp.get("priority") || undefined,
    module: sp.get("module") || undefined,
    platform: sp.get("platform") || undefined,
    take: 50,
  });
  return NextResponse.json({ items });
}
