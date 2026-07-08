export type SocialPlatform = "FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "YOUTUBE" | "X";

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  connected: boolean;
  followers: number;
  engagement: number;
}

export type PostStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED";

export interface SocialPost {
  id: string;
  platform: string;
  caption: string;
  status: PostStatus;
  publishDate: string;
}
