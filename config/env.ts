export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "",
  apiBase: process.env.NEXT_PUBLIC_API_BASE ?? "",
  isDev: process.env.NODE_ENV === "development",
} as const;
