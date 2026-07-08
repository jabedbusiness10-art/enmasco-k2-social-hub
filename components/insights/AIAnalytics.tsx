"use client";

import { motion } from "framer-motion";
import type { AIStat } from "@/types/insights";

type AIAnalyticsProps = {
  stats: AIStat;
};

const items = [
  { label: "Prompts Generated", value: stats.promptsGenerated.toLocaleString() },
  { label: "Content Created", value: stats.contentCreated },
  { label: "Tokens Used", value: stats.tokensUsed.toLocaleString() },
  { label: "Top Module", value: stats.topAiModule },
  { label: "Most Used Template", value: stats.mostUsedTemplate },
];

export default function AIAnalytics({ stats }: AIAnalyticsProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">K2Kai AI Analytics</div>
      <div className="mt-3 grid grid-cols-1 gap-2">
        {items.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
          >
            <div className="text-xs text-white/60">{item.label}</div>
            <div className="text-sm font-semibold text-white">{item.value}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
