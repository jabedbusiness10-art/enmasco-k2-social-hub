import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { cancelPost } from "@/services/publishing/service";

export const runtime = "nodejs";

/** TASK-75 — Cancel a scheduled/approved post (server-validated). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const post = await cancelPost(id, { id: perm.user!.id, name: perm.user!.name });
    return NextResponse.json({ post });
  } catch (e: any) {
    const status = e?.message?.includes("Cannot cancel") ? 409 : 400;
    return NextResponse.json({ error: e?.message ?? "Cancel failed" }, { status });
  }
}
