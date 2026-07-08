"use client";

import { motion } from "framer-motion";

type ExecutiveOverviewProps = {
  summary: { label: string; value: string }[];
};

export default function ExecutiveOverview({ summary }: ExecutiveOverviewProps) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Executive Overview</div>
      <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
        {summary.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
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
