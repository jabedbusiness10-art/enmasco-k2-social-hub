"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export default function AnalyticsPanel() {
  return (
    <div className="space-y-4 p-4 text-sm text-white/80">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Analytics</div>
      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="text-[10px] uppercase tracking-widest text-white/60">Today's Reach</div>
          <div className="mt-1 text-lg font-semibold text-white">142K</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="text-[10px] uppercase tracking-widest text-white/60">Engagement Rate</div>
          <div className="mt-1 text-lg font-semibold text-white">6.8%</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="text-[10px] uppercase tracking-widest text-white/60">Followers Growth</div>
          <div className="mt-1 text-lg font-semibold text-white">+1,240</div>
        </div>
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-3 text-xs text-white/60">
          Dummy chart placeholder
        </div>
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-3 text-xs text-white/60">
          Top Performing Post placeholder
        </div>
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-3 text-xs text-white/60">
          Recent Comments placeholder
        </div>
      </div>
    </div>
  );
}
