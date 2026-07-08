"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

type ConversationHeaderProps = {
  channelName: string;
};

export default function ConversationHeader({ channelName }: ConversationHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3">
      <div>
        <div className="text-sm font-semibold text-white">{channelName}</div>
        <div className="text-[11px] text-white/50">Enterprise channel</div>
      </div>
      <motion.button whileHover={{ y: -1, scale: 1.05 }} className="rounded-lg border border-white/10 bg-white/[0.05] p-2 text-white/70 transition hover:text-white">
        <ChevronDown className="h-4 w-4" strokeWidth={1.8} />
      </motion.button>
    </div>
  );
}
