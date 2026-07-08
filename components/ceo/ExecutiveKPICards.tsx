"use client";

import { motion } from "framer-motion";
import type { CEOKPI } from "@/types/ceo";

type ExecutiveKPICardsProps = {
  kpis: CEOKPI[];
};

export default function ExecutiveKPICards({ kpis }: ExecutiveKPICardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi, index) => (
        <motion.div
          key={kpi.id}
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, delay: index * 0.03 }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">{kpi.title}</div>
          <div className="mt-2 space-y-1">
            {kpi.metrics.map((metric) => (
              <div key={metric.label} className="flex items-center justify-between text-xs text-white/80">
                <span className="text-white/60">{metric.label}</span>
                <span className="font-semibold text-white">{metric.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
