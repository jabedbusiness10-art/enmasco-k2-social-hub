"use client";

import { motion } from "framer-motion";

export function SecurityScore({ score, grade, factors }: { score: number; grade: string; factors: { label: string; impact: number; detail: string }[] }) {
  const color = score >= 85 ? "#34d399" : score >= 70 ? "#38bdf8" : score >= 50 ? "#fbbf24" : "#fb7185";
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <div className="flex flex-col items-center gap-4 p-5">
      <div className="relative h-36 w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
          <motion.circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }} transition={{ duration: 0.8 }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-[10px] uppercase tracking-wider text-white/40">/ 100</span>
        </div>
      </div>
      <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold" style={{ color }}>{grade}</div>
      <div className="w-full space-y-1.5">
        {factors.map((f) => (
          <div key={f.label} className="flex items-center justify-between text-[11px]">
            <span className="text-white/60">{f.label}</span>
            <span className={f.impact < 0 ? "text-rose-300" : "text-emerald-300"}>{f.impact < 0 ? f.impact : `+${f.impact}`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
