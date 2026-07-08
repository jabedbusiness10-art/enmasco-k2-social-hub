export type CampaignStatus = "DRAFT" | "ACTIVE" | "COMPLETED";
export type PostStatus = "DRAFT" | "APPROVED" | "SCHEDULED" | "PUBLISHED";

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
}

export interface ScheduledPost {
  id: string;
  platform: string;
  title: string;
  scheduledAt: string;
  status: PostStatus;
}
