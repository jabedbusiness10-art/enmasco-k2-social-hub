import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { getExecutiveSnapshot, Range } from "@/lib/executive/aggregate";
import { log } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TASK-58 — Executive Intelligence snapshot API.
 * Aggregates REAL data from every production service. Sections without a real
 * source return available:false so the UI shows "No Data Available" (TASK-51).
 */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("VIEW_ANALYTICS", req);
  if (!perm.ok) {
    log("api").warn("executive snapshot denied", { ip: req.headers.get("x-forwarded-for") });
    return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  }

  const rangeParam = (req.nextUrl.searchParams.get("range") as Range) || "7d";
  const valid: Range[] = ["today", "yesterday", "7d", "30d", "90d", "year"];
  const range = valid.includes(rangeParam) ? rangeParam : "7d";

  const snapshot = await getExecutiveSnapshot(range);
  log("api").info("executive snapshot served", { range });
  return NextResponse.json(snapshot);
}
