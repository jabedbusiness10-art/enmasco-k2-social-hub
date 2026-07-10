import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { disconnectAccount } from "@/services/social/accounts";

export const runtime = "nodejs";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const perm = await requirePermission("SOCIAL_DISCONNECT", req);
  if (!perm.ok) {
    return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await disconnectAccount(id);
  return NextResponse.json({ success: true });
}
