import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { syncWebsiteConnection } from "@/services/website/connection";

export const runtime = "nodejs";

/** TASK-47 — Trigger a content sync (blog/news/media). Architecture for TASK-48. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: 401 });
  const { id } = await params;
  try {
    const result = await syncWebsiteConnection(id);
    return NextResponse.json({ sync: result });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Sync failed" }, { status: 400 });
  }
}
