"use client";

import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Network, Users, Bot, BarChart3, ShieldCheck } from "lucide-react";

export type NavSection = {
  key: string;
  label: string;
  icon: LucideIcon;
  children: {
    label: string;
    href: string;
  }[];
};

export const sidebarConfig: NavSection[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    children: [
      { label: "Overview", href: "/" },
    ],
  },
  {
    key: "social",
    label: "Social",
    icon: Network,
    children: [
      { label: "Social Hub", href: "/social" },
      { label: "Publishing", href: "/publishing" },
      { label: "Planner", href: "/planner" },
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
      { label: "Analytics", href: "/insights" },
      { label: "Reports", href: "/insights" },
    ],
  },
  {
    key: "administration",
    label: "Administration",
    icon: ShieldCheck,
    children: [
      { label: "Security", href: "/dashboard/users" },
      { label: "Account", href: "/settings/accounts" },
      { label: "Settings", href: "/dashboard/users" },
    ],
  },
];
