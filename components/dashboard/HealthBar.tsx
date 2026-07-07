"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

type HealthBarProps = {
  value: number;
  title?: string;
};

export default function HealthBar({ value, title = "SYSTEM HEALTH" }: HealthBarProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <motion.section
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-emerald-200/10 bg-white/[0.045] p-4 backdrop-blur-xl"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200/20 bg-emerald-300/[0.08] text-emerald-100 shadow-[0_0_28px_rgba(16,185,129,0.24)]">
            <Activity className="h-4 w-4" strokeWidth={1.9} />
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
            {title}
          </h3>
        </div>
        <div className="text-lg font-semibold text-emerald-100 drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]">
          {safeValue}%
        </div>
      </div>

      <div className="relative h-3 overflow-hidden rounded-full border border-white/10 bg-black/40 shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safeValue}%` }}
          transition={{ duration: 1.15, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
          className="health-bar-fill absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 via-lime-200 to-emerald-300 shadow-[0_0_26px_rgba(52,211,153,0.8)]"
        />
        <div className="absolute inset-0 rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)] opacity-70" />
      </div>
    </motion.section>
  );
}
