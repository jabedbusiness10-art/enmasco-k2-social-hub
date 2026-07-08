"use client";

import { motion } from "framer-motion";
import type { QuickReply } from "@/types/inbox";

type QuickRepliesProps = {
  replies: QuickReply[];
  onSelect: (text: string) => void;
};

export default function QuickReplies({ replies, onSelect }: QuickRepliesProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Quick Replies</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {replies.map((reply) => (
          <button key={reply.id} onClick={() => onSelect(reply.text)} className="rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-xs text-white transition hover:bg-white/10">
            {reply.title}
          </button>
        ))}
      </div>
    </div>
  );
}
