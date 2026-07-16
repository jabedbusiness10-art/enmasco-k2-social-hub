import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { SUPPORTED_LOCALES, LOCALE_META } from "@/lib/i18n/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const perm = await requirePermission("MANAGE_USERS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const rows = SUPPORTED_LOCALES.map((l) => ({ code: l, label: LOCALE_META[l].label, native: LOCALE_META[l].native, flag: LOCALE_META[l].flag, dir: LOCALE_META[l].dir }));
  return NextResponse.json({ languages: rows, default: "en" });
}
