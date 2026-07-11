"use client";

import { motion } from "framer-motion";
import { CalendarDays, Clock, FileEdit, CheckCircle2, Hourglass, CalendarRange } from "lucide-react";
import type { PlannerStats as Stats } from "@/data/contentPlanner";

export default function PlannerStats({ stats }: { stats: Stats }) {
  const cards: { l: string; v: number; icon: any; tint: string }[] = [
    { l: "Total Planned", v: stats.totalPlanned, icon: CalendarDays, tint: "text-sky-300" },
    { l: "Scheduled Today", v: stats.scheduledToday, icon: Clock, tint: "text-emerald-300" },
    { l: "Drafts", v: stats.drafts, icon: FileEdit, tint: "text-white/60" },
    { l: "Published", v: stats.published, icon: CheckCircle2, tint: "text-violet-300" },
    { l: "Pending Approval", v: stats.pendingApproval, icon: Hourglass, tint: "text-amber-300" },
    { l: "This Month", v: stats.thisMonth, icon: CalendarRange, tint: "text-rose-300" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {cards.map((c, i) => (
        <motion.div
          key={c.l}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-[0_12px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl"
        >
          <div className={`flex items-center gap-1.5 text-white/45 ${c.tint}`}>
            <c.icon className="h-4 w-4" />
            <span className="text-[10px] uppercase tracking-wide">{c.l}</span>
          </div>
          <div className="mt-1 text-2xl font-bold text-white">{c.v}</div>
        </motion.div>
      ))}
    </div>
  );
}
