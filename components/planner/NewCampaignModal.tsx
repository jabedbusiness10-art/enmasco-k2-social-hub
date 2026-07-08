"use client";

import { motion } from "framer-motion";
import type { Campaign } from "@/types/planner";

type NewCampaignModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (campaign: Omit<Campaign, "id">) => void;
};

export default function NewCampaignModal({ isOpen, onClose, onCreate }: NewCampaignModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.06] p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Create Campaign</div>
            <div className="text-xs text-white/60">Create a new content campaign.</div>
          </div>
          <button onClick={onClose} className="text-xs text-white/60">Close</button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3">
          <input className="h-9 rounded-xl border border-white/10 bg-white/[0.05] px-3 text-sm text-white" placeholder="Campaign Name" />
          <div className="grid grid-cols-2 gap-3">
            <input className="h-9 rounded-xl border border-white/10 bg-white/[0.05] px-3 text-sm text-white" placeholder="Start Date" type="date" />
            <input className="h-9 rounded-xl border border-white/10 bg-white/[0.05] px-3 text-sm text-white" placeholder="End Date" type="date" />
          </div>
          <button
            onClick={() =>
              onCreate({
                name: "New Campaign",
                status: "DRAFT",
                startDate: new Date().toISOString(),
                endDate: new Date().toISOString(),
              })
            }
            className="h-9 rounded-xl border border-white/10 bg-white/[0.08] text-xs font-semibold text-white"
          >
            Create Campaign
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
