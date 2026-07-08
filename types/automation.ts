export type WorkflowStatus = "RUNNING" | "SUCCESS" | "FAILED" | "WAITING";
export type AutomationEnabled = "enabled" | "disabled";

export interface Workflow {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: AutomationEnabled;
  nextExecution?: string;
}

export interface Execution {
  id: string;
  workflowName: string;
  status: WorkflowStatus;
  startedAt: string;
  duration?: string;
}
