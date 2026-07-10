import type { SocialPlatform, PlatformStatus } from "@/types/company-social";

// UI-only display metadata for each platform. Does NOT change the backend or DB.
export const PLATFORM_UI: Record<
  SocialPlatform,
  {
    apiVersion: string;
    platformType: string;
    businessManager: string;
    scopes: string[];
    description: string;
    requirements: string[];
  }
> = {
  FACEBOOK: {
    apiVersion: "Graph API v19.0",
    platformType: "Social Network",
    businessManager: "Meta Business Manager",
    scopes: ["pages_manage_posts", "pages_read_engagement", "instagram_basic", "business_management"],
    description: "Connect your official Facebook Page to publish and analyze posts.",
    requirements: ["Meta App ID & Secret", "Facebook Page admin access", "Business Manager assigned"],
  },
  INSTAGRAM: {
    apiVersion: "Graph API v19.0",
    platformType: "Photo & Video",
    businessManager: "Meta Business Manager",
    scopes: ["instagram_basic", "instagram_content_publish", "instagram_manage_insights"],
    description: "Connect an Instagram Business account for scheduling and insights.",
    requirements: ["Instagram Business/Creator account", "Linked to a Facebook Page", "Meta App credentials"],
  },
  LINKEDIN: {
    apiVersion: "LinkedIn API v2",
    platformType: "Professional Network",
    businessManager: "LinkedIn Company Page",
    scopes: ["r_organization_admin", "w_member_social", "rw_organization_admin"],
    description: "Connect your LinkedIn Company Page to share updates with your network.",
    requirements: ["LinkedIn App Client ID & Secret", "Company Page admin role", "Marketing/Compliance scopes"],
  },
  YOUTUBE: {
    apiVersion: "YouTube Data API v3",
    platformType: "Video Platform",
    businessManager: "Google Cloud Project",
    scopes: ["youtube.upload", "youtube.readonly", "youtubepartner"],
    description: "Connect your YouTube channel for video publishing and analytics.",
    requirements: ["Google OAuth Client ID & Secret", "YouTube channel ownership", "Data API v3 enabled"],
  },
  X: {
    apiVersion: "X API v2",
    platformType: "Microblogging",
    businessManager: "X Developer Project",
    scopes: ["tweet.write", "users.read", "offline.access"],
    description: "Connect your X (Twitter) account for real-time posting.",
    requirements: ["X API Key & Secret", "OAuth 2.0 callback", "Elevated/Pro tier"],
  },
  WEBSITE: {
    apiVersion: "Webhook v1",
    platformType: "Web Property",
    businessManager: "Self-hosted",
    scopes: ["read", "write"],
    description: "Connect an official website or web property.",
    requirements: ["Site URL", "Webhook endpoint", "Verification token"],
  },
};

export const HEALTH_SERVICES: { key: string; label: string; ok: boolean }[] = [
  { key: "meta", label: "Meta API", ok: true },
  { key: "linkedin", label: "LinkedIn API", ok: true },
  { key: "google", label: "Google API", ok: true },
  { key: "x", label: "X API", ok: true },
  { key: "webhook", label: "Webhook", ok: true },
  { key: "scheduler", label: "Scheduler", ok: true },
  { key: "refresh", label: "Token Refresh", ok: true },
];

export function statusColorClass(status: PlatformStatus): string {
  switch (status) {
    case "CONNECTED":
      return "text-emerald-300 border-emerald-400/40 bg-emerald-400/10";
    case "EXPIRING_SOON":
      return "text-amber-300 border-amber-400/40 bg-amber-400/10";
    case "DISCONNECTED":
      return "text-red-300 border-red-400/40 bg-red-400/10";
    case "PERMISSION_ERROR":
      return "text-orange-300 border-orange-400/40 bg-orange-400/10";
    default:
      return "text-white/70 border-white/20 bg-white/5";
  }
}

export function statusDotClass(status: PlatformStatus): string {
  switch (status) {
    case "CONNECTED":
      return "bg-emerald-400";
    case "EXPIRING_SOON":
      return "bg-amber-400";
    case "DISCONNECTED":
      return "bg-red-400";
    case "PERMISSION_ERROR":
      return "bg-orange-400";
    default:
      return "bg-white/40";
  }
}
