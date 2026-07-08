"use client";

import { motion } from "framer-motion";
import type { SocialAccount } from "@/types/social";

type PlatformSidebarProps = {
  accounts: SocialAccount[];
  selectedPlatformId: string;
  onSelectPlatform: (platformId: string) => void;
};

export default function PlatformSidebar({ accounts, selectedPlatformId, onSelectPlatform }: PlatformSidebarProps) {
  return (
    <div className="flex h-full flex-col border-r border-white/10 bg-white/[0.02]">
      <div className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Platforms</div>
      <div className="space-y-1 px-3">
        <motion.button
          onClick={() => onSelectPlatform("all")}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
            selectedPlatformId === "all" ? "bg-white/[0.08] text-white" : "text-white/70 hover:bg-white/[0.06] hover:text-white"
          }`}
        >
          <span>All Platforms</span>
        </motion.button>
        {accounts.map((account, index) => (
          <motion.button
            key={account.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            onClick={() => onSelectPlatform(account.id)}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
              selectedPlatformId === account.id ? "bg-white/[0.08] text-white" : "text-white/70 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <span>{account.platform}</span>
            <span className={`h-2 w-2 rounded-full ${account.connected ? "bg-emerald-400" : "bg-red-400"}`} />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
