// ===========================================================================
// TASK-52 — app/api/ai/knowledge/route.ts
// Secure knowledge-base endpoint. Server-side only; no key exposure.
// ===========================================================================

import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { answerWithKnowledge, listCategories, listDocuments } from "@/lib/ai/services/knowledge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requirePermission("VIEW_AI", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const cat = await listCategories();
  const docs = await listDocuments();
  return NextResponse.json({ categories: cat, documents: docs });
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission("VIEW_AI", req);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { question?: string };
  if (!body.question) return NextResponse.json({ error: "question is required" }, { status: 400 });
  try {
    const answer = await answerWithKnowledge(auth.user.id, body.question);
    return NextResponse.json({ answer });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Knowledge query failed" }, { status: 500 });
  }
}
