import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "K2KAI Social Flow",
    short_name: "K2KAI",
    description: "Enterprise Social Media Automation Platform",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "any",
    background_color: "#030305",
    theme_color: "#0a0a14",
    lang: "en",
    dir: "ltr",
    categories: ["business", "productivity", "social"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
    shortcuts: [
      { name: "Dashboard", url: "/dashboard", description: "Command center overview" },
      { name: "Social Hub", url: "/dashboard/social", description: "Social accounts & composer" },
      { name: "Media Library", url: "/dashboard/media", description: "Media assets & collections" },
      { name: "Analytics", url: "/dashboard/insights/analytics", description: "Enterprise analytics" },
      { name: "Messages", url: "/dashboard/messenger", description: "Messenger & conversations" },
      { name: "Settings", url: "/dashboard/admin/company", description: "Administration settings" },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}
