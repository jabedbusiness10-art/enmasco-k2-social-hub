"use client";

import { motion } from "framer-motion";
import { Search, Bell, Crown } from "lucide-react";

type ExecutiveHeaderProps = {
  timeLabel: string;
};

export default function ExecutiveHeader({ timeLabel }: ExecutiveHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3"
    >
      <div>
        <div className="text-lg font-semibold text-white">CEO Command Center</div>
        <div className="text-[11px] uppercase tracking-widest text-white/60">Executive Social Operations</div>
      </div>
      <div className="flex items-center gap-2">
        <input className="h-9 w-56 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-xs text-white outline-none placeholder:text-white/40" placeholder="Global search..." />
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/80">
          <Bell className="h-4 w-4" strokeWidth={1.8} />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-400 shadow-[0_0_10px_rgba(239,68,68,0.9)]" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
          <Crown className="h-4 w-4 text-white/70" strokeWidth={1.8} />
        </div>
      </div>
    </motion.div>
  );
}
