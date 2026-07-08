"use client";

import { motion } from "framer-motion";
import type { SocialStat } from "@/types/insights";

type SocialChartsProps = {
  stats: SocialStat[];
};

export default function SocialCharts({ stats }: SocialChartsProps) {
  const maxReach = Math.max(...stats.map((s) => s.reach));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Social Performance</div>
      <div className="mt-4 space-y-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.platform}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white">{stat.platform}</div>
                <div className="text-xs text-white/60">Reach {stat.reach.toLocaleString()} • Engagement {stat.engagement}%</div>
              </div>
              <div className="text-xs text-white/60">Clicks {stat.clicks.toLocaleString()}</div>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full border border-white/10 bg-white/[0.04]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(stat.reach / maxReach) * 100}%` }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="h-full rounded-full bg-sky-500/80"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
