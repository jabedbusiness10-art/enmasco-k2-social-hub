"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Conversation, InboxMessage, InboxFolder, CustomerProfileData, InboxNotification } from "@/types/inbox";
import InboxHeader from "@/components/inbox/InboxHeader";
import InboxSidebar from "@/components/inbox/InboxSidebar";
import InboxFilters, {
  type PlatformFilter,
  type ExtraFilter,
} from "@/components/inbox/InboxFilters";
import ConversationList from "@/components/inbox/ConversationList";
import ConversationView from "@/components/inbox/ConversationView";
import MessageComposer from "@/components/inbox/MessageComposer";
import CustomerProfile from "@/components/inbox/CustomerProfile";
import AIReplyPanel from "@/components/inbox/AIReplyPanel";
import { startOfDay, startOfWeek } from "date-fns";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useMessengerSocket } from "@/components/messaging/MessengerSocketProvider";

export default function InboxPage() {
  const { data: session } = useSession();
  const { inboxVersion } = useMessengerSocket();
  const [folder, setFolder] = useState<InboxFolder>("ALL");
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [extra, setExtra] = useState<ExtraFilter>("all");
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string>("");
  const [items, setItems] = useState<Conversation[]>([]);
  const [history, setHistory] = useState<InboxMessage[]>([]);
  const [profile, setProfile] = useState<CustomerProfileData | undefined>();
  const [aiDraft, setAiDraft] = useState("");
  const [stats, setStats] = useState({ total: 0, unread: 0, replied: 0, pending: 0, resolved: 0, assigned: 0, starred: 0, archived: 0, spam: 0, averageResponseSeconds: null as number | null, providerUnread: {} as Record<string, number> });

  const active = items.find((c) => c.id === activeId) ?? items[0];
  const activeMessages = history.filter((m) => m.conversationId === active?.id);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({ take: "30" });
    if (platform !== "all") params.set("provider", platform);
    if (search.trim()) params.set("search", search.trim());
    if (folder === "UNREAD" || extra === "unread") params.set("unread", "true");
    if (folder === "ASSIGNED" || extra === "assigned") {
      const userId = (session?.user as any)?.id;
      if (userId) params.set("assignedToId", userId);
    }
    if (folder === "STARRED") params.set("starred", "true");
    if (folder === "ARCHIVED") params.set("archived", "true");
    else params.set("archived", "false");
    if (folder === "SPAM") params.set("spam", "true");
    else params.set("spam", "false");
    if (extra === "today") params.set("from", startOfDay(new Date()).toISOString());
    if (extra === "week") params.set("from", startOfWeek(new Date()).toISOString());
    return params.toString();
  }, [platform, search, folder, extra, session]);

  const loadInbox = useCallback(async () => {
    const [conversationResponse, statsResponse] = await Promise.all([
      fetch(`/api/inbox/conversations?${queryString}`, { cache: "no-store" }),
      fetch(`/api/inbox/stats?${queryString}`, { cache: "no-store" }),
    ]);
    if (!conversationResponse.ok) throw new Error((await conversationResponse.json().catch(() => ({}))).error ?? "Inbox loading failed");
    const conversationData = await conversationResponse.json();
    const nextItems: Conversation[] = conversationData.items ?? [];
    setItems(nextItems);
    setActiveId((current) => nextItems.some((item) => item.id === current) ? current : nextItems[0]?.id ?? "");
    if (statsResponse.ok) setStats((await statsResponse.json()).stats);
  }, [queryString]);

  const loadThread = useCallback(async (conversationId: string) => {
    if (!conversationId) { setHistory([]); setProfile(undefined); return; }
    const [detailResponse, messageResponse] = await Promise.all([
      fetch(`/api/inbox/conversations/${conversationId}`, { cache: "no-store" }),
      fetch(`/api/inbox/conversations/${conversationId}/messages?take=100`, { cache: "no-store" }),
    ]);
    if (detailResponse.ok) setProfile((await detailResponse.json()).profile);
    if (messageResponse.ok) setHistory((await messageResponse.json()).items ?? []);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadInbox().catch((error) => toast.error(error.message)), 250);
    return () => clearTimeout(timer);
  }, [loadInbox, inboxVersion]);

  useEffect(() => { loadThread(active?.id ?? "").catch((error) => toast.error(error.message)); }, [active?.id, inboxVersion, loadThread]);

  const counts: Partial<Record<InboxFolder, number>> = useMemo(() => {
    return { ALL: stats.total, UNREAD: stats.unread, ASSIGNED: stats.assigned, STARRED: stats.starred, ARCHIVED: stats.archived, SPAM: stats.spam };
  }, [stats]);

  const inboxKpis = useMemo(() => {
    const seconds = stats.averageResponseSeconds;
    const average = seconds == null ? "—" : seconds < 60 ? `${seconds}s` : seconds < 3600 ? `${Math.round(seconds / 60)}m` : `${(seconds / 3600).toFixed(1)}h`;
    return [
      { label: "Total Conversations", value: String(stats.total) },
      { label: "Unread", value: String(stats.unread) },
      { label: "Replied", value: String(stats.replied) },
      { label: "Pending", value: String(stats.pending) },
      { label: "Resolved", value: String(stats.resolved) },
      { label: "Avg Response", value: average },
    ];
  }, [stats]);

  const notifications: InboxNotification[] = useMemo(() => Object.entries(stats.providerUnread).filter(([, count]) => count > 0).map(([provider, count]) => ({ platform: provider as InboxNotification["platform"], count })), [stats.providerUnread]);

  const handleAction = async (
    action: "reply" | "read" | "assign" | "star" | "archive" | "delete"
  ) => {
    if (!active) return;
    if (action === "reply") return;
    let response: Response;
    if (action === "assign") response = await fetch(`/api/inbox/conversations/${active.id}/assign`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assignedToId: (session?.user as any)?.id }) });
    else if (action === "delete") response = await fetch(`/api/inbox/conversations/${active.id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "CLOSED" }) });
    else response = await fetch(`/api/inbox/conversations/${active.id}/actions`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, value: action === "read" ? true : action === "star" ? !active.starred : true }) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return toast.error(body.error ?? "Conversation action failed");
    await loadInbox();
    toast.success("Conversation updated");
  };

  const handleSend = async (text: string) => {
    if (!active) return;
    const response = await fetch(`/api/inbox/conversations/${active.id}/reply`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, attachments: [] }) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return toast.error(body.error ?? "Reply failed");
    setAiDraft("");
    await Promise.all([loadInbox(), loadThread(active.id)]);
    toast.success("Reply confirmed by provider");
  };

  const handleAI = (text: string) => setAiDraft(text);

  return (
    <div className="flex h-full flex-col">
      <InboxHeader notifications={notifications} />

      <div className="mt-4 flex flex-col gap-4 overflow-y-auto px-4 pb-6">
        {/* KPI stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {inboxKpis.map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.25)] transition-all duration-300 hover:border-red-500/30 hover:shadow-[0_0_44px_rgba(248,113,113,0.12)]"
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider text-white/50">{k.label}</div>
              <div className="mt-2 text-2xl font-bold text-white">{k.value}</div>
            </motion.div>
          ))}
        </div>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr_300px]">
          {/* left: sidebar + filters */}
          <aside className="flex flex-col gap-3">
            <InboxSidebar active={folder} onSelect={setFolder} counts={counts} />
            <InboxFilters
              platform={platform}
              onPlatform={setPlatform}
              extra={extra}
              onExtra={setExtra}
              search={search}
              onSearch={setSearch}
            />
          </aside>

          {/* middle: list + conversation */}
          <div className="flex flex-col gap-3">
            <ConversationList conversations={items} activeId={active?.id ?? ""} onSelect={setActiveId} />
            {active && (
              <ConversationView
                conversation={active}
                messages={activeMessages}
                onAction={handleAction}
                composerSlot={<MessageComposer onSend={handleSend} draft={aiDraft} />}
                profileSlot={undefined}
              />
            )}
          </div>

          {/* right: profile + AI */}
          <aside className="flex flex-col gap-3">
            <CustomerProfile profile={profile} />
            <AIReplyPanel onApply={handleAI} conversationId={active?.id} />
          </aside>
        </section>
      </div>
    </div>
  );
}
