"use client";

import { motion } from "framer-motion";

type InsightSummaryProps = {
  summary: string[];
};

export default function InsightSummary({ summary }: InsightSummaryProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">AI Summary — K2Kai Weekly Insight</div>
      <ul className="mt-3 space-y-2">
        {summary.map((item, index) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            className="text-sm text-white/80"
          >
            • {item}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
