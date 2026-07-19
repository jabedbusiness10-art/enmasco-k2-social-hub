import { NextRequest, NextResponse } from "next/server";
import { requireInboxPermission, canViewAllInbox } from "@/services/inbox/auth";
import { listInboxConversations, type InboxFilters, type InboxPriority, type InboxProvider, type InboxStatus } from "@/services/inbox/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireInboxPermission("VIEW_INBOX", req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const sp = req.nextUrl.searchParams;
  const filters: InboxFilters = {
    provider: (sp.get("provider")?.toUpperCase() || undefined) as InboxProvider | undefined,
    status: (sp.get("status")?.toUpperCase() || undefined) as InboxStatus | undefined,
    priority: (sp.get("priority")?.toUpperCase() || undefined) as InboxPriority | undefined,
    assignedToId: sp.get("assignedToId") || undefined,
    unread: sp.has("unread") ? sp.get("unread") === "true" : undefined,
    starred: sp.has("starred") ? sp.get("starred") === "true" : undefined,
    archived: sp.has("archived") ? sp.get("archived") === "true" : undefined,
    spam: sp.has("spam") ? sp.get("spam") === "true" : undefined,
    tag: sp.get("tag") || undefined,
    customer: sp.get("customer") || undefined,
    search: sp.get("search")?.slice(0, 200) || undefined,
    from: sp.get("from") ? new Date(sp.get("from")!) : undefined,
    to: sp.get("to") ? new Date(sp.get("to")!) : undefined,
  };
  const allowedProviders = ["FACEBOOK", "INSTAGRAM", "YOUTUBE", "WEBSITE", "LINKEDIN", "TIKTOK"];
  if (filters.provider && !allowedProviders.includes(filters.provider)) return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  const actor = { id: auth.user.id, name: auth.user.name, canViewAll: await canViewAllInbox(auth.user) };
  const result = await listInboxConversations(actor, filters, Number(sp.get("page") || 1), Number(sp.get("take") || 30));
  return NextResponse.json(result, { headers: { "Cache-Control": "private, no-store" } });
}
