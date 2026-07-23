import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { reschedulePost } from "@/services/publishing/service";

export const runtime = "nodejs";

/** TASK-75 — Reschedule a post to a new date/time (drag-and-drop / picker). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const when = body?.scheduledAt;
  if (!when) return NextResponse.json({ error: "scheduledAt required" }, { status: 400 });
  try {
    const post = await reschedulePost(id, when, { id: perm.user!.id, name: perm.user!.name });
    return NextResponse.json({ post });
  } catch (e: any) {
    const status = e?.message?.includes("Cannot reschedule") ? 409 : 400;
    return NextResponse.json({ error: e?.message ?? "Reschedule failed" }, { status });
  }
}
