export type ReportType = "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY";

export interface KPIMetric {
  id: string;
  label: string;
  value: string;
}

export interface SocialStat {
  platform: string;
  reach: number;
  engagement: number;
  clicks: number;
  followers: number;
  impressions: number;
}

export interface TeamStat {
  tasksCompleted: number;
  messagesSent: number;
  campaignsManaged: number;
  dutyCompletion: number;
  activeUsers: number;
}

export interface AutomationStat {
  workflowRuns: number;
  successRate: number;
  failedJobs: number;
  avgExecutionTime: string;
}

export interface AIStat {
  promptsGenerated: number;
  contentCreated: number;
  tokensUsed: number;
  topAiModule: string;
  mostUsedTemplate: string;
}

export interface CampaignStat {
  roi: string;
  bestCampaign: string;
  scheduledPosts: number;
  publishedPosts: number;
  approvalRate: string;
}

export interface Report {
  id: string;
  type: ReportType;
  generatedAt: string;
}
