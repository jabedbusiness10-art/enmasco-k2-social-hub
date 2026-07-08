"use client";

import { motion } from "framer-motion";
import type { TeamStat } from "@/types/insights";

type TeamAnalyticsProps = {
  stats: TeamStat;
};

const items = [
  { label: "Tasks Completed", value: teamStat.tasksCompleted },
  { label: "Messages Sent", value: teamStat.messagesSent },
  { label: "Campaigns Managed", value: teamStat.campaignsManaged },
  { label: "Duty Completion", value: `${teamStat.dutyCompletion}%` },
  { label: "Active Users", value: teamStat.activeUsers },
] as const;

export default function TeamAnalytics({ stats }: TeamAnalyticsProps) {
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
