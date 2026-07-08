"use client";

import { motion } from "framer-motion";
import type { CampaignStat } from "@/types/insights";

type ReportPanelProps = {
  stats: CampaignStat;
  reports: { id: string; type: string; generatedAt: string }[];
};

export default function ReportPanel({ stats, reports }: ReportPanelProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Reports</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {Object.entries({
          "Campaign ROI": stats.roi,
          "Best Campaign": stats.bestCampaign,
          "Scheduled Posts": stats.scheduledPosts,
          "Published Posts": stats.publishedPosts,
          "Approval Rate": stats.approvalRate,
        }).map(([label, value], index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
          >
            <div className="text-[11px] text-white/60">{label}</div>
            <div className="text-sm font-semibold text-white">{value as string}</div>
          </motion.div>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {reports.map((report, index) => (
          <div key={report.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/80">
            <div>
              <div className="font-semibold text-white">{report.type}</div>
              <div className="text-white/60">{report.generatedAt}</div>
            </div>
            <div className="flex gap-2">
              <motion.button whileHover={{ y: -1, scale: 1.02 }} className="rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-white/[0.12]">PDF</motion.button>
              <motion.button whileHover={{ y: -1, scale: 1.02 }} className="rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-white/[0.12]">Excel</motion.button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
