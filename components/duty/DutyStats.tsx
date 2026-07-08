"use client";

import { motion } from "framer-motion";
import { BriefcaseBusiness } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import type { Duty } from "@/types/duty";

type DutyStatsProps = {
  duties: Duty[];
};

export default function DutyStats({ duties }: DutyStatsProps) {
  const total = duties.length;
  const pending = duties.filter((d) => d.status === "PENDING").length;
  const inProgress = duties.filter((d) => d.status === "IN_PROGRESS").length;
  const completed = duties.filter((d) => d.status === "COMPLETED").length;
  const overdue = duties.filter((d) => d.status !== "COMPLETED" && d.status !== "CANCELLED" && new Date(d.dueDate) < new Date()).length;

  const items = [
    { label: "Total Duties", value: total },
    { label: "Pending", value: pending },
    { label: "In Progress", value: inProgress },
    { label: "Completed", value: completed },
    { label: "Overdue", value: overdue },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
          <GlassCard className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-red-100 shadow-[0_0_22px_rgba(248,113,113,0.18)]">
              <BriefcaseBusiness className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div>
              <div className="text-2xl font-semibold text-white">{item.value}</div>
              <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/60">{item.label}</div>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}
