"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Reply, MailOpen, UserCheck, Star, Archive, Trash2 } from "lucide-react";
import type { Conversation, InboxMessage } from "@/types/inbox";
import { PLATFORMS, initials } from "./platformMeta";
import { fmtDateTime } from "./dateUtils";
import StatusBadge from "./StatusBadge";

type Props = {
  conversation: Conversation;
  messages: InboxMessage[];
  onAction: (action: "reply" | "read" | "assign" | "star" | "archive" | "delete") => void;
  composerSlot: React.ReactNode;
  profileSlot: React.ReactNode;
};

export default function ConversationView({
  conversation,
  messages,
  onAction,
  composerSlot,
  profileSlot,
}: Props) {
  const meta = PLATFORMS[conversation.platform];

  const actions: {
    key: Props["onAction"] extends (a: infer A) => void ? A : never;
    label: string;
    icon: typeof Reply;
  }[] = [
    { key: "reply", label: "Reply", icon: Reply },
    { key: "read", label: "Mark Read", icon: MailOpen },
    { key: "assign", label: "Assign", icon: UserCheck },
    { key: "star", label: "Star", icon: Star },
    { key: "archive", label: "Archive", icon: Archive },
    { key: "delete", label: "Delete", icon: Trash2 },
  ];

  return (
    <div className="flex h-full flex-col gap-3">
      {/* header */}
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl">
        <div className="relative">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/8 text-base font-semibold text-white/85">
            {initials(conversation.customer)}
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#0b0b0d] ${meta.dot}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-white">{conversation.customer}</span>
            <StatusBadge status={conversation.status} />
          </div>
          <div className={`text-xs ${meta.text}`}>{meta.label}</div>
        </div>
      </div>

      {/* quick actions */}
      <div className="flex flex-wrap gap-1.5">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.key}
              onClick={() => onAction(a.key)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-white/75 transition hover:border-red-400/30 hover:bg-white/10 hover:text-white"
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
              {a.label}
            </button>
          );
        })}
      </div>

      {/* history */}
      <div className="flex-1 space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-3 backdrop-blur-xl">
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const isCustomer = m.sender === "CUSTOMER";
            const isAI = m.sender === "AI";
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isCustomer ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    isCustomer
                      ? "bg-white/[0.06] text-white/85"
                      : isAI
                        ? "bg-violet-500/20 text-violet-100"
                        : "bg-red-500/15 text-red-50"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span className="mt-1 block text-[10px] text-white/40">{fmtDateTime(m.sentAt)}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {composerSlot}
      {profileSlot}
    </div>
  );
}
