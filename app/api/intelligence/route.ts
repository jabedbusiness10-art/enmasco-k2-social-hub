import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { getIntelligenceFeed } from "@/services/intelligence/feed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requirePermission("VIEW_NOTIFICATIONS", req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });
  const feed = await getIntelligenceFeed();
  return NextResponse.json(feed);
}
