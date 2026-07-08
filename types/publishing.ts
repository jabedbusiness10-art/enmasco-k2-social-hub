export type PublishPlatform = "facebook" | "instagram" | "linkedin" | "website" | "youtube";
export type PublishStatus = "QUEUED" | "PUBLISHING" | "SUCCESS" | "FAILED" | "RETRY" | "CANCELLED";

export interface PublishJob {
  id: string;
  platform: PublishPlatform;
  title: string;
  status: PublishStatus;
  scheduledAt: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  content?: string;
  publishedAt?: string;
  retryCount?: number;
  error?: string;
}

export interface PlatformStatusItem {
  platform: PublishPlatform;
  connected: boolean;
  queueSize: number;
  lastPublish: string;
  lastError?: string;
}

export interface PublishHistoryItem {
  id: string;
  platform: PublishPlatform;
  publishedAt: string;
  title: string;
  result: "SUCCESS" | "FAILED";
  retryCount: number;
}
