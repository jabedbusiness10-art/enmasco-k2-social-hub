import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { listPrompts, createPrompt } from "@/services/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requirePermission("VIEW_AI", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const prompts = await listPrompts(auth.user.id);
  return NextResponse.json({ prompts });
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission("VIEW_AI", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.title || !body.prompt) {
    return NextResponse.json({ error: "title and prompt are required" }, { status: 400 });
  }
  const prompt = await createPrompt(auth.user.id, {
    title: body.title,
    prompt: body.prompt,
    category: body.category ?? "General",
    favorite: Boolean(body.favorite),
  });
  return NextResponse.json({ prompt });
}
