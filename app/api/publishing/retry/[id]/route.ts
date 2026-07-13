import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { retryPost } from "@/services/publishing/service";

export const runtime = "nodejs";

/** TASK-48 — Retry a failed post (re-runs real publish for failed platforms). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: 401 });
  const { id } = await params;
  try {
    const { results } = await retryPost(id);
    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Retry failed" }, { status: 500 });
  }
}
