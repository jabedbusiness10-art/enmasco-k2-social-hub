"use client";

import { AnimatePresence } from "framer-motion";
import type { Conversation } from "@/types/inbox";
import ConversationCard from "./ConversationCard";

type Props = {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
};

export default function ConversationList({ conversations, activeId, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {conversations.map((c) => (
          <ConversationCard
            key={c.id}
            conversation={c}
            active={c.id === activeId}
            onClick={() => onSelect(c.id)}
          />
        ))}
      </AnimatePresence>
      {conversations.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/50">
          No conversations match the current filters.
        </div>
      )}
    </div>
  );
}
