import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { duplicatePost } from "@/services/publishing/service";

export const runtime = "nodejs";

/** TASK-75 — Server-side duplicate of a post (status reset to DRAFT). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const post = await duplicatePost(id, { id: perm.user!.id, name: perm.user!.name });
    return NextResponse.json({ post }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Duplicate failed" }, { status: 400 });
  }
}
