export type WorkflowStatus = "RUNNING" | "SUCCESS" | "FAILED" | "WAITING";
export type AutomationEnabled = "enabled" | "disabled";
export type JobStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "RETRYING" | "PAUSED";

export interface Workflow {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: AutomationEnabled;
  nextExecution?: string;
  successRate?: number;
}

export interface Execution {
  id: string;
  workflowName: string;
  status: WorkflowStatus;
  startedAt: string;
  duration?: string;
}

export interface WorkflowJob {
  id: string;
  workflow: string;
  status: JobStatus;
  startedAt: string;
  duration?: string;
}

export interface AutomationLogEntry {
  id: string;
  workflow: string;
  message: string;
  time: string;
}

export interface QueueHealth {
  queueSize: number;
  workers: number;
  memory: string;
  cpu: string;
  health: string;
  uptime: string;
}
