"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Report } from "@/types/insights";
import KPIStats from "@/components/insights/KPIStats";
import SocialCharts from "@/components/insights/SocialCharts";
import TeamAnalytics from "@/components/insights/TeamAnalytics";
import AutomationAnalytics from "@/components/insights/AutomationAnalytics";
import AIAnalytics from "@/components/insights/AIAnalytics";
import ReportPanel from "@/components/insights/ReportPanel";
import InsightSummary from "@/components/insights/InsightSummary";
import ExportActions from "@/components/insights/ExportActions";
import { kpiMetrics, socialStats, teamStat, automationStat, aiStat, campaignStat, reports, insightSummary } from "@/data/insights";

export default function InsightsPage() {
  const [dateRange, setDateRange] = useState("Last 7 days");

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3"
      >
        <div>
          <h1 className="text-xl font-semibold text-white">K2 Insights</h1>
          <p className="text-xs text-slate-400">Enterprise Analytics & Reports</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-9 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-xs text-white outline-none focus:border-sky-400 focus:ring-0"
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This quarter</option>
          </select>
          <ExportActions
            onExportPdf={() => {}}
            onExportExcel={() => {}}
            onRefresh={() => {}}
          />
        </div>
      </motion.div>

      <div className="mt-4 flex flex-col gap-4 overflow-y-auto px-4">
        <KPIStats metrics={kpiMetrics} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <SocialCharts stats={socialStats} />
          <TeamAnalytics stats={teamStat} />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <AutomationAnalytics stats={automationStat} />
          <AIAnalytics stats={aiStat} />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <InsightSummary summary={insightSummary} />
          <ReportPanel stats={campaignStat} reports={reports as Report[]} />
        </div>
      </div>
    </div>
  );
}
