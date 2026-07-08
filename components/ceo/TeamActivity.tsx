"use client";

import { motion } from "framer-motion";
import type { ActivityItem } from "@/types/ceo";

type TeamActivityProps = {
  activities: ActivityItem[];
};

export default function TeamActivity({ activities }: TeamActivityProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Team Activity</div>
      <div className="mt-3 space-y-2">
        {activities.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
          >
            <div>
              <div className="text-sm font-semibold text-white">{item.user}</div>
              <div className="text-xs text-white/60">{item.action}</div>
            </div>
            <div className="text-xs text-white/50">{item.time}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
