import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { updatePrompt, deletePrompt } from "@/services/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission("VIEW_AI", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const updated = await updatePrompt(auth.user.id, id, body);
  return NextResponse.json({ prompt: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission("VIEW_AI", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const { id } = await params;
  await deletePrompt(auth.user.id, id);
  return NextResponse.json({ ok: true });
}
