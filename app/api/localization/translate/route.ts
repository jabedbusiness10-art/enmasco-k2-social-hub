import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { translateText } from "@/services/ai/provider";
import { isLocale } from "@/lib/i18n/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const perm = await requirePermission("MANAGE_USERS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const text = String(body.text ?? "");
  const target = isLocale(body.target) ? body.target : "en";
  const source = isLocale(body.source) ? body.source : "en";
  if (!text.trim()) return NextResponse.json({ error: "text required" }, { status: 400 });
  // Original is never overwritten — we only return a separate translation.
  const translated = await translateText(text, target, source);
  return NextResponse.json({ source, target, original: text, translated, overwritten: false });
}
