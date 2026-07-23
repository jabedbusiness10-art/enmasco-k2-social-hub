"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import SparkLine from "@/components/analytics/charts/SparkLine";

type Props = {
  label: string;
  icon: string;
  total: number;
  /** Percentage growth vs previous period. null/undefined = no comparison data (never fabricated). */
  growth?: number | null;
  trend: number[];
  index?: number;
  /** Render total as a percentage (Engagement Rate). */
  percent?: boolean;
};

// Guard every numeric render against undefined / null / NaN / Infinity.
function safeNumber(v: number | null | undefined, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function Counter({ value, percent }: { value: number; percent?: boolean }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) =>
    percent ? `${safeNumber(v).toFixed(1)}%` : Math.round(safeNumber(v)).toLocaleString()
  );
  useEffect(() => {
    const controls = animate(mv, safeNumber(value), { duration: 1.1, ease: "easeOut" });
    return controls.stop;
  }, [value, mv]);
  return <motion.span>{rounded}</motion.span>;
}

export default function StatsCard({ label, icon, total, growth, trend, index = 0, percent }: Props) {
  // Normalize growth: only a finite number is valid; null/undefined => no comparison data.
  const safeGrowth: number | null =
    typeof growth === "number" && Number.isFinite(growth) ? growth : null;

  // Trend badge is shown ONLY when real comparison data exists.
  const showTrend = safeGrowth !== null;
  const up = safeGrowth !== null && safeGrowth >= 0;
  const color = up ? "#34D399" : "#F87171";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={{ y: -4, boxShadow: "0_0_44px_rgba(248,113,113,0.14)" }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.25)] transition-shadow duration-300 hover:border-red-500/30"
    >
      {/* glass reflection */}
      <div className="pointer-events-none absolute -inset-x-10 -top-10 h-20 rotate-12 bg-white/5 blur-2xl group-hover:bg-white/10" />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/55">
            {label}
          </span>
        </div>
        {showTrend ? (
          <span
            className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold"
            style={{ color, backgroundColor: `${color}1A` }}
          >
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {up ? "+" : ""}
            {safeGrowth!.toFixed(1)}%
          </span>
        ) : (
          // Honest fallback — no fabricated 0.0%.
          <span className="inline-flex items-center rounded-full bg-white/5 px-1.5 py-0.5 text-[11px] font-medium text-white/40">
            No comparison data
          </span>
        )}
      </div>

      <div className="mt-3 text-2xl font-bold text-white">
        <Counter value={total} percent={percent} />
      </div>

      <div className="mt-3">
        <SparkLine data={(trend ?? []).map((v, i) => ({ label: String(i), value: safeNumber(v) }))} color={color} height={44} />
      </div>
    </motion.div>
  );
}
