"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export interface Kpi {
  label: string;
  value: number | null;
  unit?: string;
  growthPct?: number | null;
  hint?: string;
}

function fmt(n: number | null): string {
  if (n === null || n === undefined) return "—";
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function GrowthBadge({ pct }: { pct?: number | null }) {
  if (pct === null || pct === undefined)
    return (
      <span className="flex items-center gap-0.5 text-[10px] text-white/40">
        <Minus className="h-3 w-3" /> —
      </span>
    );
  const up = pct >= 0;
  return (
    <span
      className={`flex items-center gap-0.5 text-[10px] font-medium ${
        up ? "text-emerald-300" : "text-rose-300"
      }`}
    >
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

export default function KpiHeader({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="sticky top-0 z-20 -mx-1 mb-5 border-b border-white/10 bg-[#070a12]/80 px-1 py-3 backdrop-blur-md">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
            title={k.hint}
          >
            <div className="text-[10px] uppercase tracking-wide text-white/45">{k.label}</div>
            <div className="mt-0.5 flex items-end justify-between">
              <span className="text-base font-bold leading-none text-white">
                {fmt(k.value)}
                {k.unit && <span className="ml-0.5 text-[10px] font-normal text-white/50">{k.unit}</span>}
              </span>
              <GrowthBadge pct={k.growthPct} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
