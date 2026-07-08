"use client";

import { motion } from "framer-motion";
import type { Workflow } from "@/types/automation";

type AutomationCardsProps = {
  workflows: Workflow[];
  onSelect: (workflow: Workflow) => void;
};

const statusAccentMap: Record<string, string> = {
  enabled: "border-emerald-500/40 text-emerald-200",
  disabled: "border-white/10 text-white/70",
};

export default function AutomationCards({ workflows, onSelect }: AutomationCardsProps) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-3">
      {workflows.map((wf, index) => (
        <motion.button
          key={wf.id}
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          onClick={() => onSelect(wf)}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-semibold text-white">{wf.name}</div>
              <div className="mt-1 text-xs text-white/60">Trigger: {wf.trigger}</div>
              <div className="text-xs text-white/60">Action: {wf.action}</div>
            </div>
            <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${statusAccentMap[wf.enabled] || statusAccentMap.disabled}`}>{wf.enabled}</span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
