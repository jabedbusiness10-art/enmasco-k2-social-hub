"use client";

import { motion } from "framer-motion";
import { Users2, MessageSquare } from "lucide-react";
import type { Channel } from "@/types/message";

type ChatSidebarProps = {
  channels: Channel[];
  selectedChannelId: string;
  onSelectChannel: (channelId: string) => void;
};

export default function ChatSidebar({ channels, selectedChannelId, onSelectChannel }: ChatSidebarProps) {
  const onlineCount = 3;
  const offlineCount = 1;

  return (
    <div className="flex h-full flex-col border-r border-white/10 bg-white/[0.02]">
      <div className="space-y-1 p-3">
        <div className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Channels</div>
        {channels.map((channel, index) => (
          <motion.button
            key={channel.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            onClick={() => onSelectChannel(channel.id)}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
              selectedChannelId === channel.id
                ? "bg-white/[0.08] text-white"
                : "text-white/70 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <span className="text-xs text-white/50">#</span>
            {channel.name}
          </motion.button>
        ))}
      </div>

      <div className="mt-auto border-t border-white/10 p-3">
        <div className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Direct Messages</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/[0.06]">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            MD Kazim
          </div>
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/[0.06]">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Lipton
          </div>
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/[0.06]">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Sumon
          </div>
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/[0.06]">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            Jabed
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2 text-xs text-white/60">
          <Users2 className="h-3.5 w-3.5" strokeWidth={1.8} />
          <span>
            {onlineCount} online, {offlineCount} offline
          </span>
        </div>
      </div>
    </div>
  );
}
