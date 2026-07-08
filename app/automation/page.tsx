"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import AutomationStats from "@/components/automation/AutomationStats";
import AutomationCards from "@/components/automation/AutomationCards";
import WorkflowBuilder from "@/components/automation/WorkflowBuilder";
import ExecutionLog from "@/components/automation/ExecutionLog";
import AutomationTemplates from "@/components/automation/AutomationTemplates";
import WorkflowCanvas from "@/components/automation/WorkflowCanvas";
import RunHistory from "@/components/automation/RunHistory";
import { workflows as initialWorkflows, executions as initialExecutions } from "@/data/automation";
import type { Workflow, Execution } from "@/types/automation";

export default function AutomationPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [executions] = useState<Execution[]>(initialExecutions);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  const successCount = executions.filter((e) => e.status === "SUCCESS").length;
  const failedCount = executions.filter((e) => e.status === "FAILED").length;
  const successRate = executions.length ? Math.round((successCount / executions.length) * 100) : 0;

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <div>
          <h1 className="text-xl font-semibold text-white">K2Flow Automation Engine</h1>
          <p className="text-xs text-slate-400">Visual workflow automation for ENMASCO.</p>
        </div>
        <div className="flex items-center gap-2">
          <input className="h-9 w-56 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none placeholder:text-white/40" placeholder="Search workflows..." />
          <motion.button whileHover={{ y: -1, scale: 1.02 }} className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.12]">New Automation</motion.button>
        </div>
      </motion.div>

      <AutomationStats />

      <div className="mt-4 grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[16rem_1fr_16rem]">
        <div className="flex h-full flex-col border-r border-white/5">
          <div className="flex-none border-b border-white/5 px-4 py-3">
            <AutomationTemplates />
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <AutomationCards workflows={workflows} onSelect={setSelectedWorkflow} />
          </div>
        </div>
        <div className="flex h-full flex-col border-r border-white/5">
          <div className="flex-none border-b border-white/5 px-4 py-3">
            <WorkflowCanvas />
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <WorkflowBuilder workflow={selectedWorkflow} />
            <div className="mt-4">
              <div className="text-sm font-semibold text-white">Execution Log</div>
              <ExecutionLog executions={executions} />
            </div>
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="p-4">
            <GlassCard className="space-y-3 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Workflow Summary</div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white/80">{selectedWorkflow?.name ?? "No workflow selected"}</div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white/80">Next Execution: {selectedWorkflow?.nextExecution ? new Date(selectedWorkflow.nextExecution).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : "—"}</div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white/80">Success Rate: {successRate}%</div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white/80">Recent Errors: {failedCount}</div>
              <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-3 text-xs text-white/60">AI Suggestions: Placeholder</div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}

// needed for the executions import
type Execution = {
  id: string;
  workflowName: string;
  status: "RUNNING" | "SUCCESS" | "FAILED" | "WAITING";
  startedAt: string;
  duration?: string;
};
