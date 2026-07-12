"use client";

import { motion } from "framer-motion";
import { Sparkles, Workflow } from "lucide-react";
import type { Workflow as WorkflowT } from "@/types/automation";

type WorkflowBuilderProps = {
  workflow: WorkflowT | null;
};

export default function WorkflowBuilder({ workflow }: WorkflowBuilderProps) {
  const blocks = [
    { label: "Trigger", detail: workflow?.trigger ?? "—" },
    { label: "Condition", detail: workflow?.enabled ?? "—" },
    { label: "Action", detail: workflow?.action ?? "—" },
    { label: "Delay", detail: "Optional" },
    { label: "Notification", detail: "Placeholder" },
  ];

  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <Workflow className="h-4 w-4" strokeWidth={1.8} />
        {workflow ? workflow.name : "Select an automation"}
      </div>
      <div className="mt-4 space-y-2">
        {blocks.map((block, index) => (
          <motion.div
            key={block.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/80"
          >
            <Sparkles className="h-3.5 w-3.5 text-white/50" strokeWidth={1.8} />
            {block.label}: {block.detail}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
