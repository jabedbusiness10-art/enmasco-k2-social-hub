import { NextRequest, NextResponse } from "next/server";
import { requireInboxPermission, canViewAllInbox } from "@/services/inbox/auth";
import { getInboxStats, type InboxFilters, type InboxProvider } from "@/services/inbox/service";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const auth = await requireInboxPermission("VIEW_INBOX", req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const sp = req.nextUrl.searchParams;
  const filters: InboxFilters = { provider: (sp.get("provider")?.toUpperCase() || undefined) as InboxProvider | undefined, search: sp.get("search")?.slice(0, 200) || undefined, archived: sp.has("archived") ? sp.get("archived") === "true" : undefined, spam: sp.has("spam") ? sp.get("spam") === "true" : undefined };
  const stats = await getInboxStats({ id: auth.user.id, name: auth.user.name, canViewAll: await canViewAllInbox(auth.user) }, filters);
  return NextResponse.json({ stats }, { headers: { "Cache-Control": "private, max-age=15, stale-while-revalidate=30" } });
}
