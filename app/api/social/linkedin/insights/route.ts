import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { getLinkedInAnalytics } from "@/services/linkedin/sync";
import { asPublicIntegrationError } from "@/services/integrations/errors";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const perm = await requirePermission("VIEW_ANALYTICS", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: perm.error === "Unauthorized" ? 401 : 403 });
  const accountId = req.nextUrl.searchParams.get("accountId");
  if (!accountId) return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  const start = Number(req.nextUrl.searchParams.get("start") || 0);
  const end = Number(req.nextUrl.searchParams.get("end") || 0);
  try {
    return NextResponse.json(await getLinkedInAnalytics(accountId, start && end ? { start, end } : undefined));
  } catch (error) {
    const publicError = asPublicIntegrationError(error, "LINKEDIN");
    return NextResponse.json(publicError.error, { status: publicError.status });
  }
}
