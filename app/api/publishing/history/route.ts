import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { listHistory } from "@/services/publishing/service";

export const runtime = "nodejs";

/** TASK-48 — Publishing history (all attempts, optionally filtered by postId). */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: 401 });
  const postId = new URL(req.url).searchParams.get("postId") ?? undefined;
  const history = await listHistory(postId);
  return NextResponse.json({ history });
}
