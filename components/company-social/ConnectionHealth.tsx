"use client";

import { motion } from "framer-motion";
import type { HealthItem } from "@/types/company-social";

type ConnectionHealthProps = {
  items: HealthItem[];
};

const statusColor: Record<string, string> = {
  Healthy: "text-emerald-200",
  Valid: "text-emerald-200",
  Strong: "text-emerald-200",
  Good: "text-emerald-200",
  Warning: "text-amber-200",
  Critical: "text-red-200",
};

export default function ConnectionHealth({ items }: ConnectionHealthProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Connection Health</div>
      <div className="mt-3 space-y-2">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
          >
            <div className="text-xs text-white/60">{item.label}</div>
            <div className={`text-xs font-semibold ${statusColor[item.value] || "text-white"}`}>{item.value}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
