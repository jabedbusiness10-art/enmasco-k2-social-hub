import type { Workflow, Execution } from "@/types/automation";

export const workflows: Workflow[] = [
  { id: "w1", name: "Daily Social Posting", trigger: "Scheduled", action: "Publish Post", enabled: "enabled", nextExecution: "2026-07-09T08:00" },
  { id: "w2", name: "Weekly Report Generator", trigger: "Weekly", action: "Create Report", enabled: "enabled", nextExecution: "2026-07-12T09:00" },
  { id: "w3", name: "Auto Caption + Schedule", trigger: "New Post", action: "Generate Caption", enabled: "enabled", nextExecution: "2026-07-08T11:00" },
  { id: "w4", name: "Campaign Approval Flow", trigger: "New Campaign", action: "Notify Manager", enabled: "disabled", nextExecution: "2026-07-10T10:00" },
  { id: "w5", name: "Lead Notification", trigger: "New Lead", action: "Send Email", enabled: "disabled", nextExecution: "" },
];

export const executions: Execution[] = [
  { id: "e1", workflowName: "Daily Social Posting", status: "SUCCESS", startedAt: "2026-07-08T08:00", duration: "3s" },
  { id: "e2", workflowName: "Auto Caption + Schedule", status: "SUCCESS", startedAt: "2026-07-08T10:30", duration: "1s" },
  { id: "e3", workflowName: "Weekly Report Generator", status: "FAILED", startedAt: "2026-07-07T09:00", duration: "0s" },
  { id: "e4", workflowName: "Campaign Approval Flow", status: "WAITING", startedAt: "2026-07-09T08:00", duration: "" },
];
