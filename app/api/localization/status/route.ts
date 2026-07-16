import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { getCoverage } from "@/lib/i18n/loader";
import { SUPPORTED_LOCALES } from "@/lib/i18n/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const perm = await requirePermission("MANAGE_USERS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const coverage = getCoverage();
  const totalKeys = coverage[0]?.total ?? 0;
  const status = coverage.map((c) => {
    const pct = c.total ? Math.round((c.translated / c.total) * 100) : 100;
    const state = pct === 100 ? "COMPLETE" : pct >= 60 ? "IN_PROGRESS" : pct > 0 ? "NEEDS_REVIEW" : "MISSING";
    return { locale: c.locale, percent: pct, state, missingCount: c.missing.length, totalKeys };
  });
  return NextResponse.json({ totalKeys, languages: SUPPORTED_LOCALES.length, status });
}
