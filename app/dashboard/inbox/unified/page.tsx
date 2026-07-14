"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  conversations,
  messages,
  customerProfiles,
  inboxKpis,
} from "@/data/inbox";
import type { Conversation, InboxMessage, ConversationStatus, InboxFolder } from "@/types/inbox";
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
import { isToday, isThisWeek, parseISO } from "date-fns";

export default function InboxPage() {
  const [folder, setFolder] = useState<InboxFolder>("ALL");
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [extra, setExtra] = useState<ExtraFilter>("all");
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string>("c1");
  const [items, setItems] = useState<Conversation[]>(conversations);
  const [history, setHistory] = useState<InboxMessage[]>(messages);

  const active = items.find((c) => c.id === activeId) ?? items[0];
  const activeMessages = useMemo(
    () => history.filter((m) => m.conversationId === active?.id),
    [history, active]
  );
  const profile = active ? customerProfiles[active.id] : undefined;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((c) => {
      // folder
      if (folder === "UNREAD" && c.unread === 0) return false;
      if (folder === "ASSIGNED" && !c.assignedTo) return false;
      if (folder === "STARRED" && !c.starred) return false;
      if (folder === "ARCHIVED" && !c.archived) return false;
      if (folder === "SPAM" && !c.spam) return false;
      // platform
      if (platform !== "all" && c.platform !== platform) return false;
      // extra
      if (extra === "unread" && c.unread === 0) return false;
      if (extra === "assigned" && !c.assignedTo) return false;
      if (extra === "today" && !isToday(parseISO(c.lastActivity))) return false;
      if (extra === "week" && !isThisWeek(parseISO(c.lastActivity))) return false;
      // search
      if (q) {
        const hay = `${c.customer} ${c.lastMessage} ${c.tags?.join(" ") ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, folder, platform, extra, search]);

  const counts: Partial<Record<InboxFolder, number>> = useMemo(() => {
    return {
      ALL: items.length,
      UNREAD: items.filter((c) => c.unread > 0).length,
      ASSIGNED: items.filter((c) => c.assignedTo).length,
      STARRED: items.filter((c) => c.starred).length,
      ARCHIVED: items.filter((c) => c.archived).length,
      SPAM: items.filter((c) => c.spam).length,
    };
  }, [items]);

  const handleAction = (
    action: "reply" | "read" | "assign" | "star" | "archive" | "delete"
  ) => {
    if (!active) return;
    switch (action) {
      case "read":
        setItems((prev) => prev.map((c) => (c.id === active.id ? { ...c, unread: 0 } : c)));
        break;
      case "star":
        setItems((prev) => prev.map((c) => (c.id === active.id ? { ...c, starred: !c.starred } : c)));
        break;
      case "archive":
        setItems((prev) => prev.map((c) => (c.id === active.id ? { ...c, archived: true } : c)));
        break;
      case "assign":
        setItems((prev) =>
          prev.map((c) => (c.id === active.id ? { ...c, assignedTo: "MD Kazim", status: "REPLIED" as ConversationStatus } : c))
        );
        break;
      case "delete":
        setItems((prev) => prev.filter((c) => c.id !== active.id));
        if (items.length > 1) setActiveId(items.find((c) => c.id !== active.id)!.id);
        break;
      case "reply":
        // focus composer (no-op here; composer handles send)
        break;
    }
  };

  const handleSend = (text: string) => {
    if (!active) return;
    const msg: InboxMessage = {
      id: `m${Date.now()}`,
      conversationId: active.id,
      sender: "AGENT",
      text,
      sentAt: new Date().toISOString(),
    };
    setHistory((prev) => [...prev, msg]);
    setItems((prev) => prev.map((c) => (c.id === active.id ? { ...c, status: "REPLIED" as ConversationStatus, unread: 0 } : c)));
  };

  const handleAI = (text: string) => {
    if (!active) return;
    const msg: InboxMessage = {
      id: `m${Date.now()}`,
      conversationId: active.id,
      sender: "AI",
      text,
      sentAt: new Date().toISOString(),
    };
    setHistory((prev) => [...prev, msg]);
  };

  return (
    <div className="flex h-full flex-col">
      <InboxHeader />

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
            <ConversationList conversations={filtered} activeId={active?.id ?? ""} onSelect={setActiveId} />
            {active && (
              <ConversationView
                conversation={active}
                messages={activeMessages}
                onAction={handleAction}
                composerSlot={<MessageComposer onSend={handleSend} />}
                profileSlot={undefined}
              />
            )}
          </div>

          {/* right: profile + AI */}
          <aside className="flex flex-col gap-3">
            <CustomerProfile profile={profile} />
            <AIReplyPanel onApply={handleAI} customerMessage={activeMessages.filter((m) => m.sender === "CUSTOMER").slice(-1)[0]?.text ?? active?.lastMessage ?? ""} />
          </aside>
        </section>
      </div>
    </div>
  );
}
