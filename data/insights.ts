import type { KPIMetric, SocialStat, TeamStat, AutomationStat, AIStat, CampaignStat, Report } from "@/types/insights";

export const kpiMetrics: KPIMetric[] = [
  { id: "reach", label: "Total Reach", value: "384K" },
  { id: "engagement", label: "Engagement Rate", value: "7.2%" },
  { id: "followers", label: "Followers Growth", value: "+2,140" },
  { id: "ai", label: "AI Usage", value: "1,824 prompts" },
  { id: "automation", label: "Automation Success", value: "98%" },
  { id: "campaign", label: "Campaign Performance", value: "42" },
];

export const socialStats: SocialStat[] = [
  { platform: "Facebook", reach: 120000, engagement: 6.4, clicks: 3200, followers: 21500, impressions: 420000 },
  { platform: "Instagram", reach: 98000, engagement: 8.1, clicks: 4500, followers: 13900, impressions: 310000 },
  { platform: "LinkedIn", reach: 64000, engagement: 5.3, clicks: 1800, followers: 8420, impressions: 180000 },
  { platform: "X", reach: 54000, engagement: 3.9, clicks: 1200, followers: 9300, impressions: 150000 },
  { platform: "YouTube", reach: 38000, engagement: 4.7, clicks: 900, followers: 12400, impressions: 90000 },
];

export const teamStat: TeamStat = {
  tasksCompleted: 128,
  messagesSent: 3420,
  campaignsManaged: 14,
  dutyCompletion: 91,
  activeUsers: 34,
};

export const automationStat: AutomationStat = {
  workflowRuns: 86,
  successRate: 98,
  failedJobs: 2,
  avgExecutionTime: "2.4s",
};

export const aiStat: AIStat = {
  promptsGenerated: 1824,
  contentCreated: 210,
  tokensUsed: 94000,
  topAiModule: "K2Kai Social",
  mostUsedTemplate: "Auto Caption + Schedule",
};

export const campaignStat: CampaignStat = {
  roi: "312%",
  bestCampaign: "Eid eCommerce Blitz",
  scheduledPosts: 38,
  publishedPosts: 102,
  approvalRate: "88%",
};

export const insightSummary = [
  "Instagram engagement increased 14%.",
  "LinkedIn CTR improved.",
  "Automation success rate reached 98%.",
  "Best posting time: 8 PM.",
];

export const reports: Report[] = [
  { id: "r1", type: "DAILY", generatedAt: "2026-07-08" },
  { id: "r2", type: "WEEKLY", generatedAt: "2026-07-05" },
  { id: "r3", type: "MONTHLY", generatedAt: "2026-06-30" },
  { id: "r4", type: "QUARTERLY", generatedAt: "2026-06-30" },
];
