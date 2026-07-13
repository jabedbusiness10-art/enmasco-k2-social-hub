import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { disconnectWebsiteConnection } from "@/services/website/connection";

export const runtime = "nodejs";

/** TASK-47 — Disconnect (delete credentials link) a website connection. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const perm = await requirePermission("SOCIAL_DISCONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: 401 });
  const { id } = await params;
  try {
    await disconnectWebsiteConnection(id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Disconnect failed" }, { status: 400 });
  }
}
