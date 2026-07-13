import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { refreshLinkedInAccount } from "@/services/social/accounts";

export const runtime = "nodejs";

/** TASK-46 — Refresh a LinkedIn connection's access token. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const updated = await refreshLinkedInAccount(id);
    if (!updated) {
      return NextResponse.json(
        { error: "LinkedIn connection not found or no refresh token available" },
        { status: 404 },
      );
    }
    return NextResponse.json({ account: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Refresh failed" }, { status: 400 });
  }
}
