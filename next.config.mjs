import { config } from "dotenv";

config({ path: ".env.local", override: true });
if (!process.env.DATABASE_URL) config({ path: ".env", override: true });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    DATABASE_URL: process.env.DATABASE_URL || "",
  },
  async redirects() {
    return [
      // Old top-level routes → new /dashboard/* architecture
      { source: "/scheduler", destination: "/dashboard/social/scheduler", permanent: true },
      { source: "/planner", destination: "/dashboard/social/drafts", permanent: true },
      { source: "/content-planner", destination: "/dashboard/social/planner", permanent: true },
      { source: "/media", destination: "/dashboard/social/media", permanent: true },
      { source: "/social", destination: "/dashboard/social", permanent: true },
      { source: "/engagement", destination: "/dashboard/social/engagement", permanent: true },
      { source: "/automation", destination: "/dashboard/ai/workflows", permanent: true },
      { source: "/ai", destination: "/dashboard/ai/studio", permanent: true },
      { source: "/inbox", destination: "/dashboard/inbox/all", permanent: true },
      { source: "/messages", destination: "/dashboard/inbox/all", permanent: true },
      { source: "/duty-routine", destination: "/dashboard/team/duty", permanent: true },
      { source: "/dashboard/users", destination: "/dashboard/team/members", permanent: true },
      { source: "/dashboard/settings", destination: "/dashboard/admin/company", permanent: true },
      { source: "/settings/account", destination: "/dashboard/admin/security", permanent: true },
      { source: "/settings/accounts", destination: "/dashboard/admin/apis", permanent: true },
      { source: "/settings/social", destination: "/dashboard/social/accounts", permanent: true },
      { source: "/notifications", destination: "/dashboard/admin/notifications", permanent: true },
      { source: "/insights", destination: "/dashboard/insights/overview", permanent: true },
      { source: "/messenger", destination: "/dashboard/messenger", permanent: true },
      { source: "/groups", destination: "/dashboard/messenger/groups", permanent: true },
      { source: "/channels", destination: "/dashboard/messenger/channels", permanent: true },
      { source: "/announcements", destination: "/dashboard/messenger/announcements", permanent: true },
      { source: "/files", destination: "/dashboard/messenger/files", permanent: true },
      { source: "/starred", destination: "/dashboard/messenger/starred", permanent: true },
      { source: "/archive", destination: "/dashboard/messenger/archive", permanent: true },
      { source: "/ceo", destination: "/dashboard/team/members", permanent: true },
      { source: "/publishing", destination: "/dashboard/social/scheduler", permanent: true },
    ];
  },
};

export default nextConfig;
