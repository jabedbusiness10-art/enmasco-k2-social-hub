"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import type { SocialAccount } from "@/types/social";

type SocialOverviewCardsProps = {
  accounts: SocialAccount[];
};

export default function SocialOverviewCards({ accounts }: SocialOverviewCardsProps) {
  const labelMap: Record<string, string> = {
    FACEBOOK: "Facebook",
    INSTAGRAM: "Instagram",
    LINKEDIN: "LinkedIn",
    YOUTUBE: "YouTube",
    X: "X",
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {accounts.map((account, index) => (
        <motion.div
          key={account.id}
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: index * 0.06 }}
        >
          <GlassCard className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">{labelMap[account.platform] ?? account.platform}</div>
              <span
                className={`h-2 w-2 rounded-full ${
                  account.connected ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" : "bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.8)]"
                }`}
              />
            </div>
            <div className="text-2xl font-semibold text-white">{account.followers.toLocaleString()}</div>
            <div className="text-xs text-white/60">Followers</div>
            <div className="text-xs text-white/60">{account.platform === "YOUTUBE" ? "Engagement" : "Engagement"} {account.engagement}%</div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}
