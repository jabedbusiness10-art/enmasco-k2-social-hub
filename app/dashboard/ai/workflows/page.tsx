"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AutomationHeader from "@/components/automation/AutomationHeader";
import AutomationStats from "@/components/automation/AutomationStats";
import WorkflowList from "@/components/automation/AutomationCards";
import WorkflowBuilder from "@/components/automation/WorkflowBuilder";
import ExecutionDetails from "@/components/automation/ExecutionDetails";
import JobQueue from "@/components/automation/JobQueue";
import AutomationLogs from "@/components/automation/AutomationLogs";
import MonitoringPanel from "@/components/automation/MonitoringPanel";
import WorkflowCanvas from "@/components/automation/WorkflowCanvas";
import QueueFilters from "@/components/automation/QueueFilters";
import AutomationTemplates from "@/components/automation/AutomationTemplates";
import {
  workflows as initialWorkflows,
  executions as initialExecutions,
  jobs,
  logs,
  queueHealth,
} from "@/data/automation";
import type { Workflow, Execution } from "@/types/automation";

const tabList = ["Workflows", "Queue", "Jobs", "Logs", "Monitoring", "Settings"] as const;
type Tab = (typeof tabList)[number];

export default function AutomationPage() {
  const [tab, setTab] = useState<Tab>("Workflows");
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [executions] = useState<Execution[]>(initialExecutions);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  const successCount = executions.filter((e) => e.status === "SUCCESS").length;
  const failedCount = executions.filter((e) => e.status === "FAILED").length;
  const successRate = executions.length ? Math.round((successCount / executions.length) * 100) : 0;

  return (
    <div className="flex h-full flex-col">
      <AutomationHeader tabs={tabList} tab={tab} onSelectTab={setTab as (tab: string) => void} />
      <AutomationStats />

      <div className="mt-4 grid flex-1 grid-cols-1 overflow-hidden xl:grid-cols-[16rem_1fr_16rem]">
        <aside className="flex h-full flex-col gap-3 overflow-hidden p-4">
          <QueueFilters />
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Templates</div>
            <div className="mt-2">
              <AutomationTemplates />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <WorkflowList workflows={workflows} onSelect={setSelectedWorkflow} />
          </div>
        </aside>

        <div className="flex h-full flex-col gap-3 overflow-y-auto border-r border-white/5 p-4">
          {(tab === "Workflows" || tab === "Settings") && (
            <>
              <WorkflowCanvas />
              <WorkflowBuilder workflow={selectedWorkflow} />
            </>
          )}
          {tab === "Queue" && <JobQueue jobs={jobs} />}
          {tab === "Jobs" && <JobQueue jobs={jobs} />}
          {tab === "Logs" && <AutomationLogs logs={logs} />}
          {tab === "Monitoring" && (
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              <MonitoringPanel {...queueHealth} />
              <ExecutionDetails execution={selectedWorkflow ? executions[0] : undefined} />
            </div>
          )}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="text-sm font-semibold text-white">Execution Log</div>
            <div className="mt-2">
              <AutomationLogs logs={logs} />
            </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-col gap-3 overflow-y-auto p-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Workflow Summary</div>
            <div className="mt-3 space-y-2 text-xs text-white/80">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">{selectedWorkflow?.name ?? "No workflow selected"}</div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">Next Execution: {selectedWorkflow?.nextExecution ? new Date(selectedWorkflow.nextExecution).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—"}</div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">Success Rate: {successRate}%</div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">Recent Errors: {failedCount}</div>
              <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-3 text-white/60">AI Suggestions: Placeholder</div>
            </div>
          </div>
          <MonitoringPanel {...queueHealth} />
        </div>
      </div>
    </div>
  );
}
