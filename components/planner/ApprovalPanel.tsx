"use client";

import { motion } from "framer-motion";

type ApprovalPanelProps = {
  upcomingCount: number;
};

export default function ApprovalPanel({ upcomingCount }: ApprovalPanelProps) {
  return (
    <div className="space-y-3 p-4 text-sm text-white/80">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Campaign Progress</div>
      <div className="h-2 w-full rounded-full border border-white/10 bg-white/[0.04]">
        <motion.div initial={{ width: 0 }} animate={{ width: "60%" }} transition={{ duration: 0.6 }} className="h-full rounded-full bg-sky-500/80" />
      </div>
      <div className="flex items-center justify-between text-xs text-white/60">
        <span>Campaign progress</span>
        <span>60%</span>
      </div>

      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Upcoming Posts</div>
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white/80">{upcomingCount} upcoming posts scheduled this week</div>

      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">AI Recommendations</div>
      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-3 text-xs text-white/60">AI suggestions will appear here.</div>

      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Approval History</div>
      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-3 text-xs text-white/60">Recent approvals will appear here.</div>
    </div>
  );
}
