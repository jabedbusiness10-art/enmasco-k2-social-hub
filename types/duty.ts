export type DutyPriority = "HIGH" | "MEDIUM" | "LOW";
export type DutyStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type Duty = {
  id: string;
  title: string;
  description: string;
  department: string;
  assignedTo: string;
  priority: DutyPriority;
  status: DutyStatus;
  startDate: string;
  dueDate: string;
  attachment?: string;
};
