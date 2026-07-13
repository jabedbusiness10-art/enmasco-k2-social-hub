import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { listLabels, createLabel, updateLabel, deleteLabel } from "@/services/messaging/conversations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const labels = await listLabels();
  return Response.json({ labels });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.name) return Response.json({ error: "name required" }, { status: 400 });
  const label = await createLabel(String(body.name), body.color ?? "#38bdf8");
  return Response.json({ label }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.id) return Response.json({ error: "id required" }, { status: 400 });
  const label = await updateLabel(String(body.id), { name: body.name, color: body.color });
  return Response.json({ label });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });
  await deleteLabel(id);
  return Response.json({ ok: true });
}
