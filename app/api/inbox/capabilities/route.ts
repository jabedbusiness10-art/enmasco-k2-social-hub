import { NextRequest, NextResponse } from "next/server";
import { requireInboxPermission } from "@/services/inbox/auth";
import { getInboxCapabilities } from "@/services/inbox/capabilities";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const auth = await requireInboxPermission("VIEW_INBOX", req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  return NextResponse.json({ capabilities: await getInboxCapabilities() }, { headers: { "Cache-Control": "private, max-age=30" } });
}
