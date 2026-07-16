import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { getCoverage } from "@/lib/i18n/loader";
import { NAMESPACES } from "@/lib/i18n/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const perm = await requirePermission("MANAGE_USERS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const locale = sp.get("locale") || "en";
  const ns = sp.get("namespace");
  const coverage = getCoverage();
  const rows = coverage.map((c) => ({
    locale: c.locale,
    total: c.total,
    translated: c.translated,
    percent: c.total ? Math.round((c.translated / c.total) * 100) : 100,
    missing: ns ? c.missing.filter((k) => k.startsWith(`${ns}.`)) : c.missing,
  }));
  const selected = rows.find((r) => r.locale === locale) ?? rows[0];
  return NextResponse.json({ namespaces: NAMESPACES, coverage: rows, selected });
}
