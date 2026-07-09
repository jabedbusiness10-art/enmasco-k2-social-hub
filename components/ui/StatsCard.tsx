"use client";

import { ReactNode } from "react";

type StatsCardProps = {
  label: string;
  value: string;
  icon?: ReactNode;
};

export default function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold text-white">{value}</div>
          <div className="text-[11px] uppercase tracking-wider text-white/60">{label}</div>
        </div>
        {icon && <div className="text-white/70">{icon}</div>}
      </div>
    </div>
  );
}
