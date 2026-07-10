import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { generateContent } from "@/services/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requirePermission("VIEW_AI", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { prompt, systemPrompt, model, temperature, maxTokens } = body;
  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }
  const result = await generateContent(auth.user.id, prompt, { systemPrompt, model, temperature, maxTokens });
  return NextResponse.json({ result });
}
