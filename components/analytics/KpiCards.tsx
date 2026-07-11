"use client";

import { motion } from "framer-motion";
import {
  Eye, // reach
  Radio, // impressions
  Heart, // engagement
  UserPlus, // followers growth
  Send, // published
  Sparkles, // ai generated
  Clock, // pending scheduled
  Workflow, // automation success
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { KpiSnapshot } from "@/types/analytics";
import { compact, full, pct } from "./format";

type KpiDef = {
  key: keyof KpiSnapshot;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  /** value formatting */
  fmt: (n: number) => string;
  /** show a growth chip driven by the value's sign (for growth/rates) */
  growthFrom?: keyof KpiSnapshot;
};

const DEFS: KpiDef[] = [
  { key: "totalReach", label: "Total Reach", icon: Eye, color: "#38BDF8", fmt: (n) => compact(n) },
  { key: "totalImpressions", label: "Total Impressions", icon: Radio, color: "#818CF8", fmt: (n) => compact(n) },
  { key: "totalEngagement", label: "Total Engagement", icon: Heart, color: "#FB7185", fmt: (n) => compact(n) },
  { key: "followersGrowth", label: "Followers Growth", icon: UserPlus, color: "#34D399", fmt: (n) => compact(n), growthFrom: "followersGrowth" },
  { key: "publishedPosts", label: "Published Posts", icon: Send, color: "#FBBF24", fmt: (n) => full(n) },
  { key: "aiGeneratedContent", label: "AI Generated Content", icon: Sparkles, color: "#A78BFA", fmt: (n) => full(n) },
  { key: "pendingScheduledPosts", label: "Pending Scheduled", icon: Clock, color: "#F472B6", fmt: (n) => full(n) },
  { key: "automationSuccessRate", label: "Automation Success", icon: Workflow, color: "#22D3EE", fmt: (n) => `${n.toFixed(1)}%` },
];

export default function KpiCards({ kpi }: { kpi: KpiSnapshot }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
      {DEFS.map((d, i) => {
        const Icon = d.icon;
        const val = kpi[d.key];
        const positive = d.growthFrom ? val >= 0 : true;
        return (
          <motion.div
            key={d.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide text-white/45">{d.label}</span>
              <Icon className="h-3.5 w-3.5" style={{ color: d.color }} />
            </div>
            <div className="mt-1.5 text-xl font-bold text-white">{d.fmt(val)}</div>
            {d.growthFrom && (
              <div
                className={`mt-0.5 flex items-center gap-0.5 text-[10px] font-medium ${
                  positive ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {pct(kpi.followersGrowthPct)}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
