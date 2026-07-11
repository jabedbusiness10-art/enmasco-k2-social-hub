"use client";

import { motion } from "framer-motion";
import { CalendarClock, CheckCircle2, Send, FileEdit, AlertTriangle, Radio } from "lucide-react";

const ICONS = [CalendarClock, Send, Radio, CheckCircle2, AlertTriangle, FileEdit];

export default function SchedulerStats({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {items.map((item, i) => {
        const Icon = ICONS[i % ICONS.length];
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.25)] transition-all duration-300 hover:border-red-500/30 hover:shadow-[0_0_44px_rgba(248,113,113,0.12)]"
          >
            <div className="flex items-center gap-2 text-white/50">
              <Icon className="h-4 w-4 text-red-300" strokeWidth={1.8} />
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                {item.label}
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-white">{item.value}</div>
          </motion.div>
        );
      })}
    </div>
  );
}
