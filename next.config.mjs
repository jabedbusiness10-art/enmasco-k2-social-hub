import { config } from "dotenv";

config({ path: ".env.local", override: true });
if (!process.env.DATABASE_URL) config({ path: ".env", override: true });

/**
 * TASK-59.2 / TASK-59.7 — Production configuration.
 * - Security headers: CSP, HSTS, X-Content-Type-Options, XSS, Referrer-Policy,
 *   Permissions-Policy, frame-deny. Tuned for a Next.js App Router app that also
 *   serves a Socket.IO messenger bridge (ws) and Cloudinary media.
 * - reactStrictMode on.
 * - Images: remote patterns for Cloudinary + platform CDNs.
 * - Powered-by header removed.
 */
const isProd = process.env.NODE_ENV === "production";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' wss: https:",
      "frame-src 'self' https://www.youtube.com https://www.facebook.com",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    DATABASE_URL: process.env.DATABASE_URL || "",
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.fbcdn.net" },
      { protocol: "https", hostname: "*.instagram.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "media.licdn.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/scheduler", destination: "/dashboard/social/publisher", permanent: true },
      { source: "/planner", destination: "/dashboard/social/planner", permanent: true },
      { source: "/content-planner", destination: "/dashboard/social/planner", permanent: true },
      { source: "/social", destination: "/dashboard/social", permanent: true },
      { source: "/engagement", destination: "/dashboard/social/engagement", permanent: true },
      { source: "/automation", destination: "/dashboard/ai/workflows", permanent: true },
      { source: "/ai", destination: "/dashboard/ai/studio", permanent: true },
      { source: "/inbox", destination: "/dashboard/inbox/unified", permanent: true },
      { source: "/messages", destination: "/dashboard/social/messages", permanent: true },
      { source: "/duty-routine", destination: "/dashboard/team/tasks", permanent: true },
      { source: "/dashboard/users", destination: "/dashboard/admin/users", permanent: true },
      { source: "/dashboard/settings", destination: "/dashboard/admin/company", permanent: true },
      { source: "/settings/account", destination: "/dashboard/admin/security", permanent: true },
      { source: "/settings/accounts", destination: "/dashboard/admin/api", permanent: true },
      { source: "/settings/social", destination: "/dashboard/social/accounts", permanent: true },
      { source: "/notifications", destination: "/dashboard/admin/notifications", permanent: true },
      { source: "/insights", destination: "/dashboard/insights/analytics", permanent: true },
      { source: "/messenger", destination: "/dashboard/messenger", permanent: true },
      { source: "/groups", destination: "/dashboard/messenger/groups", permanent: true },
      { source: "/channels", destination: "/dashboard/messenger/channels", permanent: true },
      { source: "/announcements", destination: "/dashboard/messenger/announcements", permanent: true },
      { source: "/files", destination: "/dashboard/messenger/files", permanent: true },
      { source: "/starred", destination: "/dashboard/messenger/starred", permanent: true },
      { source: "/archive", destination: "/dashboard/messenger/archive", permanent: true },
      { source: "/dashboard/admin/health", destination: "/dashboard/admin/system-health", permanent: true },
      { source: "/dashboard/admin/apis", destination: "/dashboard/admin/api", permanent: true },
      { source: "/dashboard/insights/dashboard", destination: "/dashboard/insights/analytics", permanent: true },
      { source: "/dashboard/team/duty", destination: "/dashboard/team/tasks", permanent: true },
      { source: "/dashboard/social/scheduler", destination: "/dashboard/social/publisher", permanent: true },
      { source: "/dashboard/inbox/all", destination: "/dashboard/inbox/unified", permanent: true },
      { source: "/ceo", destination: "/dashboard/team/members", permanent: true },
      { source: "/publishing", destination: "/dashboard/social/publisher", permanent: true },
    ];
  },
};

export default nextConfig;
