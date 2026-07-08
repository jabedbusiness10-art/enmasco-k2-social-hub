"use client";

import { motion } from "framer-motion";
import type { TeamStat } from "@/types/insights";

type TeamAnalyticsProps = {
  stats: TeamStat;
};

export default function TeamAnalytics({ stats }: TeamAnalyticsProps) {
  const items = [
    { label: "Tasks Completed", value: stats.tasksCompleted },
    { label: "Messages Sent", value: stats.messagesSent },
    { label: "Campaigns Managed", value: stats.campaignsManaged },
    { label: "Duty Completion", value: `${stats.dutyCompletion}%` },
    { label: "Active Users", value: stats.activeUsers },
  ] as const;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Team Performance</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {items.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
          >
            <div className="text-[11px] text-white/60">{item.label}</div>
            <div className="text-lg font-semibold text-white">{item.value}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
