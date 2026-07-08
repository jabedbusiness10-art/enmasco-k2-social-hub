export type PlatformKey = "facebook" | "instagram" | "linkedin";
export type PostStatus = "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "SCHEDULED" | "PUBLISHED" | "FAILED";

export interface ScheduledPost {
  id: string;
  title: string;
  caption: string;
  platform: PlatformKey;
  mediaId?: string;
  scheduledAt: string;
  status: PostStatus;
  owner: string;
  campaign?: string;
  tags: string[];
  approvalRequired: boolean;
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
}
