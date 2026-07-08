import type { Workflow, Execution, WorkflowJob, AutomationLogEntry, QueueHealth } from "@/types/automation";

export const workflows: Workflow[] = [
  { id: "w1", name: "Daily Content Scheduler", trigger: "Cron", action: "Schedule Posts", enabled: "enabled", nextExecution: "2026-07-09T08:00", successRate: 98 },
  { id: "w2", name: "Weekly Report Generator", trigger: "Weekly", action: "Create Report", enabled: "enabled", nextExecution: "2026-07-12T09:00", successRate: 95 },
  { id: "w3", name: "AI Caption Generation", trigger: "New Post", action: "Generate Caption", enabled: "enabled", nextExecution: "2026-07-08T11:00", successRate: 91 },
  { id: "w4", name: "Campaign Approval Flow", trigger: "New Campaign", action: "Notify Manager", enabled: "disabled", nextExecution: "2026-07-10T10:00", successRate: 88 },
  { id: "w5", name: "Lead Notification", trigger: "New Lead", action: "Send Email", enabled: "enabled", nextExecution: "2026-07-09T07:30", successRate: 97 },
  { id: "w6", name: "Analytics Sync", trigger: "Every 6h", action: "Sync Analytics", enabled: "enabled", nextExecution: "2026-07-08T20:00", successRate: 99 },
  { id: "w7", name: "Notification Dispatcher", trigger: "Realtime", action: "Dispatch Notification", enabled: "enabled", nextExecution: "2026-07-08T18:00", successRate: 96 },
  { id: "w8", name: "Media Processing", trigger: "Upload", action: "Process Media", enabled: "enabled", nextExecution: "2026-07-08T19:00", successRate: 94 },
];

export const executions: Execution[] = [
  { id: "e1", workflowName: "Daily Content Scheduler", status: "SUCCESS", startedAt: "2026-07-08T08:00", duration: "3s" },
  { id: "e2", workflowName: "AI Caption Generation", status: "SUCCESS", startedAt: "2026-07-08T10:30", duration: "1s" },
  { id: "e3", workflowName: "Weekly Report Generator", status: "FAILED", startedAt: "2026-07-07T09:00", duration: "0s" },
  { id: "e4", workflowName: "Campaign Approval Flow", status: "WAITING", startedAt: "2026-07-09T08:00", duration: "" },
];

export const jobs: WorkflowJob[] = [
  { id: "j1", workflow: "Daily Content Scheduler", status: "COMPLETED", startedAt: "2026-07-08 08:00", duration: "3s" },
  { id: "j2", workflow: "AI Caption Generation", status: "RUNNING", startedAt: "2026-07-08 10:30", duration: "" },
  { id: "j3", workflow: "Lead Notification", status: "QUEUED", startedAt: "2026-07-09 07:30", duration: "" },
  { id: "j4", workflow: "Analytics Sync", status: "FAILED", startedAt: "2026-07-08 06:00", duration: "0s" },
];

export const logs: AutomationLogEntry[] = [
  { id: "l1", workflow: "Daily Content Scheduler", message: "Workflow completed successfully.", time: "2026-07-08 08:01" },
  { id: "l2", workflow: "AI Caption Generation", message: "Processing caption queue...", time: "2026-07-08 10:31" },
  { id: "l3", workflow: "Analytics Sync", message: "Sync failed due to token expiry.", time: "2026-07-08 06:02" },
];

export const queueHealth: QueueHealth = {
  queueSize: jobs.length,
  workers: 4,
  memory: "128MB",
  cpu: "12%",
  health: "Healthy",
  uptime: "14d 6h",
};
