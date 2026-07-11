"use client";

import { motion } from "framer-motion";
import { Star, MoreVertical } from "lucide-react";
import type { Conversation } from "@/types/inbox";
import { PLATFORMS, initials } from "./platformMeta";
import StatusBadge from "./StatusBadge";
import { relTime } from "./dateUtils";

export default function ConversationCard({
  conversation,
  active,
  onClick,
}: {
  conversation: Conversation;
  active: boolean;
  onClick: () => void;
}) {
  const meta = PLATFORMS[conversation.platform];
  const Icon = meta.icon;
  const hasUnread = conversation.unread > 0;

  return (
    <motion.button
      layout
      onClick={onClick}
      className={`group flex w-full gap-3 rounded-2xl border p-3 text-left transition ${
        active
          ? "border-red-400/40 bg-white/[0.06] shadow-[0_0_30px_rgba(248,113,113,0.14)]"
          : "border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
      }`}
    >
      {/* avatar + platform dot */}
      <div className="relative shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/8 text-sm font-semibold text-white/80">
          {initials(conversation.customer)}
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#050505] ${meta.dot}`}
        />
      </div>

      {/* body */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <Icon className={`h-3.5 w-3.5 shrink-0 ${meta.text}`} strokeWidth={2} />
            <span
              className={`truncate text-sm ${hasUnread ? "font-semibold text-white" : "font-medium text-white/80"}`}
            >
              {conversation.customer}
            </span>
          </div>
          <span className="shrink-0 text-[10px] text-white/40">{relTime(conversation.lastActivity)}</span>
        </div>

        <p className="mt-0.5 truncate text-xs text-white/55">{conversation.lastMessage}</p>

        <div className="mt-1.5 flex items-center gap-2">
          <StatusBadge status={conversation.status} />
          {conversation.starred && <Star className="h-3 w-3 fill-amber-400 text-amber-400" strokeWidth={0} />}
          {hasUnread && (
            <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
              {conversation.unread}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
