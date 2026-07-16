"use client";

import { LucideIcon, HardDrive } from "lucide-react";
import { AnimatedCard } from "./primitives";

export function BackupStat({ label, value, icon: Icon = HardDrive, tone = "blue", hint }: { label: string; value: string | number; icon?: LucideIcon; tone?: "green" | "yellow" | "red" | "blue" | "gray"; hint?: string }) {
  const ring = { green: "border-emerald-400/20", yellow: "border-amber-400/20", red: "border-rose-400/20", blue: "border-sky-400/20", gray: "border-white/10" }[tone];
  return (
    <AnimatedCard>
      <div className={`flex h-full flex-col gap-2 rounded-2xl border ${ring} bg-white/[0.03] p-4`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-white/50">{label}</span>
          <Icon className="h-4 w-4 text-sky-300/70" />
        </div>
        <div className="text-2xl font-semibold text-white">{value}</div>
        {hint && <div className="text-[11px] text-white/40">{hint}</div>}
      </div>
    </AnimatedCard>
  );
}
