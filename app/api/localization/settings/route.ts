import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { isLocale } from "@/lib/i18n/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const perm = await requirePermission("MANAGE_USERS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const user = perm.user!;
  const me = await prisma.user.findUnique({ where: { id: user.id }, select: { language: true, timezone: true, locale: true } });
  return NextResponse.json({
    language: me?.language ?? "en",
    timezone: me?.timezone ?? "UTC",
    locale: me?.locale ?? me?.language ?? "en",
    dateFormat: "YYYY-MM-DD",
    timeFormat: "24h",
    numberFormat: "en-US",
    currency: "USD",
    firstDayOfWeek: "Monday",
  });
}

export async function PATCH(req: NextRequest) {
  const perm = await requirePermission("MANAGE_USERS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const data: any = {};
  if (typeof body.language === "string") data.language = isLocale(body.language) ? body.language : "en";
  if (typeof body.timezone === "string") data.timezone = body.timezone;
  if (typeof body.locale === "string") data.locale = isLocale(body.locale) ? body.locale : "en";
  if (typeof body.dateFormat === "string") data.dateFormat = body.dateFormat;
  if (typeof body.timeFormat === "string") data.timeFormat = body.timeFormat;
  if (typeof body.numberFormat === "string") data.numberFormat = body.numberFormat;
  if (typeof body.currency === "string") data.currency = body.currency;
  if (typeof body.firstDayOfWeek === "string") data.firstDayOfWeek = body.firstDayOfWeek;
  // persist known fields to User; richer locale prefs stored on User via existing columns
  await prisma.user.update({ where: { id: perm.user!.id }, data: { language: data.language, timezone: data.timezone, locale: data.locale } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
