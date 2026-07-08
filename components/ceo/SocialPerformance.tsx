"use client";

import { motion } from "framer-motion";
import type { SocialPlatformStat } from "@/types/ceo";

type SocialPerformanceProps = {
  stats: SocialPlatformStat[];
};

export default function SocialPerformance({ stats }: SocialPerformanceProps) {
  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
      {stats.map((item, index) => (
        <motion.div
          key={item.platform}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.04 }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
        >
          <div className="text-sm font-semibold text-white">{item.platform}</div>
          <div className="mt-2 space-y-1 text-xs text-white/80">
            <div>Followers: {item.followers.toLocaleString()}</div>
            <div>Reach: {item.reach.toLocaleString()}</div>
            <div>Engagement: {item.engagement}%</div>
            <div>Top Post: {item.topPost}</div>
            <div>Growth: {item.growth}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
