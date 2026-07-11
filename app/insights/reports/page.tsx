"use client";

import { motion } from "framer-motion";
import { FileText, Download, Filter } from "lucide-react";

const reports = [
  { name: "Weekly Engagement Summary", period: "This Week", format: "PDF" },
  { name: "Monthly Growth Report", period: "July 2026", format: "PDF" },
  { name: "Platform Breakdown", period: "Last 30 Days", format: "CSV" },
  { name: "Audience Insights", period: "Q3 2026", format: "PDF" },
  { name: "Campaign Performance", period: "Last 90 Days", format: "XLSX" },
];

export default function ReportsPage() {
  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3"
      >
        <div>
          <h1 className="text-xl font-semibold text-white">Reports</h1>
          <p className="text-xs text-white/45">Generated analytics reports & exportable summaries</p>
        </div>
        <button className="flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-xs text-white/80 hover:bg-white/10">
          <Filter className="h-3.5 w-3.5" /> Filter
        </button>
      </motion.div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {reports.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-sky-400/40"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
                <FileText className="h-5 w-5 text-sky-300" strokeWidth={1.8} />
              </span>
              <div>
                <div className="text-sm font-semibold text-white">{r.name}</div>
                <div className="text-xs text-white/50">{r.period}</div>
              </div>
            </div>
            <button className="flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-xs text-white/80 hover:bg-white/10">
              <Download className="h-3.5 w-3.5" /> {r.format}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
