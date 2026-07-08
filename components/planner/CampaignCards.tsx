"use client";

import { motion } from "framer-motion";
import type { Campaign } from "@/types/planner";

type CampaignCardsProps = {
  campaigns: Campaign[];
};

const statusAccent: Record<string, string> = {
  DRAFT: "border-white/10 text-white/70",
  ACTIVE: "border-emerald-500/40 text-emerald-200",
  COMPLETED: "border-sky-500/40 text-sky-200",
};

export default function CampaignCards({ campaigns }: CampaignCardsProps) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-3">
      {campaigns.map((campaign, index) => (
        <motion.div
          key={campaign.id}
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-semibold text-white">{campaign.name}</div>
              <div className="mt-1 text-xs text-white/60">
                {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
              </div>
            </div>
            <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${statusAccent[campaign.status] || statusAccent.DRAFT}`}>
              {campaign.status}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
