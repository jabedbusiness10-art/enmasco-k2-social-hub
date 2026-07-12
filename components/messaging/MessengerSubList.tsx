"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Hash, Users, Crown, Lock, Star, Archive, Paperclip, Languages, Megaphone } from "lucide-react";
import { useMessenger } from "@/components/messaging/useMessenger";
import type { ConversationDTO } from "@/types/messenger";

function PresenceDot({ status }: { status?: string }) {
  const color = status === "ONLINE" ? "bg-emerald-400" : status === "BUSY" ? "bg-red-500" : status === "AWAY" ? "bg-amber-400" : status === "DND" ? "bg-rose-500" : "bg-slate-500";
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />;
}
function initials(name: string) { return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase(); }

export default function MessengerSubList({
  title, kind, icon: Icon, filter, cta,
}: {
  title: string;
  kind?: string;
  icon: React.ComponentType<{ className?: string }>;
  filter?: (c: ConversationDTO) => boolean;
  cta?: { label: string; href: string };
}) {
  const router = useRouter();
  const { conversations, loading } = useMessenger();
  const list = useMemo(() => conversations.filter((c) => (kind ? c.kind === kind : true)).filter((c) => (filter ? filter(c) : true)), [conversations, kind, filter]);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200/30 bg-sky-500/10 text-sky-100"><Icon className="h-5 w-5" /></span>
          <div>
            <h1 className="text-lg font-semibold text-white">{title}</h1>
            <p className="text-xs text-white/50">{list.length} conversation{list.length === 1 ? "" : "s"}</p>
          </div>
        </div>
        {cta && <button onClick={() => router.push(cta.href)} className="rounded-xl bg-sky-500 px-3 py-2 text-sm font-medium text-white shadow-[0_0_22px_rgba(56,189,248,0.35)] hover:bg-sky-400">{cta.label}</button>}
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto p-3">
        {loading ? <div className="p-4 text-center text-xs text-white/40">Loading…</div> :
          list.length === 0 ? <div className="p-8 text-center text-sm text-white/50">No {title.toLowerCase()} yet</div> :
          list.map((c) => (
            <button key={c.id} onClick={() => router.push(`/messenger?c=${c.id}`)} className="flex w-full items-center gap-3 rounded-xl border border-transparent p-2 text-left hover:bg-white/[0.05]">
              <div className="relative">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/30 to-red-500/30 text-xs font-bold text-white">{c.kind === "DIRECT" && c.members[0] ? initials(c.members[0].name) : c.kind === "CHANNEL" ? "#" : initials(c.title)}</span>
                {c.kind === "DIRECT" && <span className="absolute -bottom-0.5 -right-0.5"><PresenceDot status={c.members[0]?.status} /></span>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {c.isCeoChannel && <Crown className="h-3 w-3 text-red-400" />}
                  {c.kind === "CHANNEL" && <Hash className="h-3 w-3 text-white/50" />}
                  {c.kind === "GROUP" && <Users className="h-3 w-3 text-white/50" />}
                  {c.isEncrypted && <Lock className="h-3 w-3 text-emerald-400/70" />}
                  <span className="truncate text-sm font-medium text-white">{c.title}</span>
                </div>
                <div className="truncate text-xs text-white/50">{c.lastMessage ? `${c.lastMessage.senderName}: ${c.lastMessage.content}` : "No messages"}</div>
              </div>
              {c.hasUnread && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-500 px-1 text-[10px] font-bold text-white">{c.unreadCount}</span>}
            </button>
          ))}
      </div>
    </div>
  );
}
