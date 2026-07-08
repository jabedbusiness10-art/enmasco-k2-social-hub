"use client";

import { motion } from "framer-motion";
import type { InboxMessage, Conversation } from "@/types/inbox";

type ChatWindowProps = {
  conversation: Conversation;
  messages: InboxMessage[];
};

const platformBadgeClass: Record<string, string> = {
  facebook: "border-blue-500/40 text-blue-200",
  instagram: "border-pink-500/40 text-pink-200",
  linkedin: "border-sky-500/40 text-sky-200",
  website: "border-white/20 text-white/80",
};

export default function ChatWindow({ conversation, messages }: ChatWindowProps) {
  const chatMessages = messages.filter((m) => m.conversationId === conversation.id);
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="border-b border-white/10 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-sm font-semibold text-white">{conversation.customer}</div>
            <div className="text-[11px] text-white/60">{conversation.lastMessage}</div>
          </div>
          <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${platformBadgeClass[conversation.platform]}`}>{conversation.platform}</span>
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {chatMessages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className={`rounded-2xl border px-3 py-2 text-xs ${
              message.sender === "CUSTOMER" ? "border-white/10 bg-white/5 text-white/80" : message.sender === "AGENT" ? "border-sky-500/30 bg-sky-500/10 text-sky-100" : "border-white/10 bg-white/[0.03] text-white/60"
            }`}
          >
            <div className="text-[11px] text-white/60">{message.sender} • {message.sentAt}</div>
            <div className="mt-1 text-white">{message.text}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
