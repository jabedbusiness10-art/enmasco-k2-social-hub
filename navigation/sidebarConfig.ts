"use client";

import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Network, Users, Bot, BarChart3, ShieldCheck, Inbox } from "lucide-react";

export type NavSection = {
  key: string;
  label: string;
  icon: LucideIcon;
  children: {
    label: string;
    href: string;
  }[];
  expandable?: boolean;
};

export const sidebarConfig: NavSection[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    children: [
      { label: "Overview", href: "/" },
    ],
    expandable: false,
  },
  {
    key: "social",
    label: "Social",
    icon: Network,
    children: [
      { label: "Social Hub", href: "/social" },
      { label: "Publishing", href: "/publishing" },
      { label: "Content Planner", href: "/content-planner" },
      { label: "Media Library", href: "/media" },
      { label: "Integrations", href: "/settings/social" },
    ],
  },
  {
    key: "team",
    label: "Team",
    icon: Users,
    children: [
      { label: "Users", href: "/dashboard/users" },
      { label: "Duty Routine", href: "/duty-routine" },
      { label: "Internal Chat", href: "/messages" },
    ],
  },
  {
    key: "ai-automation",
    label: "AI & Automation",
    icon: Bot,
    children: [
      { label: "K2Kai AI", href: "/ai" },
      { label: "K2Flow Engine", href: "/automation" },
    ],
  },
  {
    key: "insights",
    label: "Insights",
    icon: BarChart3,
    children: [
      { label: "Analytics", href: "/insights/analytics" },
      { label: "Reports", href: "/insights/reports" },
    ],
  },
  {
    key: "inbox",
    label: "Inbox",
    icon: Inbox,
    children: [
      { label: "Unified Inbox", href: "/inbox" },
    ],
    expandable: false,
  },
  {
    key: "administration",
    label: "Administration",
    icon: ShieldCheck,
    children: [
      { label: "Company Settings", href: "/dashboard/settings" },
      { label: "Account", href: "/settings/account" },
    ],
  },
];
