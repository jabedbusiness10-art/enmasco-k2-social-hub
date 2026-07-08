"use client";

import { motion } from "framer-motion";

type PublishingStatsProps = {
  items: { label: string; value: string }[];
};

export default function PublishingStats({ items }: PublishingStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, delay: index * 0.03 }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
        >
          <div className="text-[11px] uppercase tracking-wider text-white/60">{item.label}</div>
          <div className="mt-1 text-2xl font-semibold text-white">{item.value}</div>
        </motion.div>
      ))}
    </div>
  );
}
