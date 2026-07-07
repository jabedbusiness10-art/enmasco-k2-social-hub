export const dashboardConfig = {
  defaultRoute: "/dashboard",
  items: [
    { id: "overview", label: "Overview", href: "/dashboard" },
    { id: "posts", label: "Posts", href: "/dashboard/posts" },
    { id: "analytics", label: "Analytics", href: "/dashboard/analytics" },
    { id: "settings", label: "Settings", href: "/dashboard/settings" },
  ],
} as const;
