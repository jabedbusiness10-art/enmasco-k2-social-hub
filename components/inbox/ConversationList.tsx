"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Conversation, InboxMessage } from "@/types/inbox";

type ConversationListProps = {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
};

export default function ConversationList({ conversations, activeId, onSelect }: ConversationListProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="border-b border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/60">Conversations</div>
      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        <AnimatePresence>
          {conversations.map((conversation) => (
            <ConversationItemWrapper key={conversation.id} conversation={conversation} isActive={conversation.id === activeId} onClick={() => onSelect(conversation.id)} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ConversationItemWrapper({ conversation, isActive, onClick }: { conversation: Conversation; isActive: boolean; onClick: () => void }) {
  const platformClass: Record<string, string> = {
    facebook: "border-blue-500/40 text-blue-200",
    instagram: "border-pink-500/40 text-pink-200",
    linkedin: "border-sky-500/40 text-sky-200",
    website: "border-white/20 text-white/80",
  };

  const priorityClass: Record<string, string> = {
    LOW: "border-white/20 text-white/70",
    MEDIUM: "border-amber-500/40 text-amber-200",
    HIGH: "border-red-500/40 text-red-200",
  };

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`w-full rounded-2xl border px-3 py-2 text-left transition ${isActive ? "border-white/20 bg-white/10" : "border-white/10 bg-white/[0.03] hover:bg-white/5"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-white">{conversation.customer}</div>
        <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${platformClass[conversation.platform]}`}>{conversation.platform}</span>
      </div>
      <div className="mt-1 text-xs text-white/70">{conversation.lastMessage}</div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-white/60">
        <span>{conversation.lastActivity}</span>
        <span className={`rounded-full border px-2 py-1 ${priorityClass[conversation.priority]}`}>{conversation.priority}</span>
      </div>
      {conversation.unread > 0 && <div className="mt-1 text-right text-[11px] font-semibold text-white">{conversation.unread} unread</div>}
    </motion.button>
  );
}
