"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

type PlannerStatsProps = {
  activeCampaigns: number;
  scheduledPosts: number;
  approvedPosts: number;
  drafts: number;
  todayPosts: number;
};

export default function PlannerStats({ activeCampaigns, scheduledPosts, approvedPosts, drafts, todayPosts }: PlannerStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <Stat label="Scheduled Posts" value={scheduledPosts} />
      <Stat label="Draft Content" value={drafts} />
      <Stat label="Active Campaigns" value={activeCampaigns} />
      <Stat label="Posts Today" value={todayPosts} />
      <Stat label="Approved Content" value={approvedPosts} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="text-xs text-white/60">{label}</div>
      <div className="text-lg font-semibold text-white">{value}</div>
    </motion.div>
  );
}
