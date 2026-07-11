"use client";

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Network,
  Users,
  Bot,
  BarChart3,
  Inbox,
  ShieldCheck,
  Activity,
  Calendar,
  FileText,
  Megaphone,
  MessageSquare,
  Image,
  Camera,
  Send,
  AlertCircle,
  BarChart2,
  Users2,
  Star,
  Settings,
  KeyRound,
  UserCog,
  Lock,
  ScrollText,
  Bell,
  Database,
  HeartPulse,
  Sparkles,
  Wand2,
  Workflow,
  ListChecks,
} from "lucide-react";

export type NavSection = {
  key: string;
  label: string;
  icon: LucideIcon;
  children: { label: string; href: string }[];
  expandable?: boolean;
};

// Project architecture — every feature lives under its parent module.
// Routes that already have pages are linked directly; planned modules
// point to their future route so navigation stays consistent.
export const sidebarConfig: NavSection[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    children: [{ label: "Overview", href: "/" }],
    expandable: false,
  },
  {
    key: "social",
    label: "Social",
    icon: Network,
    children: [
      { label: "Connected Accounts", href: "/settings/social" },
      { label: "Publishing Scheduler", href: "/scheduler" },
      { label: "Content Planner", href: "/content-planner" },
      { label: "Draft Posts", href: "/planner" },
      { label: "Campaign Manager", href: "/social/campaigns" },
      { label: "Social Calendar", href: "/scheduler" },
      { label: "Engagement Monitor", href: "/engagement" },
      { label: "Comments", href: "/social/comments" },
      { label: "Media Library", href: "/media" },
    ],
  },
  {
    key: "team",
    label: "Team",
    icon: Users,
    children: [
      { label: "Members", href: "/dashboard/users" },
      { label: "Roles & Permissions", href: "/dashboard/users" },
      { label: "Assigned Tasks", href: "/duty-routine" },
      { label: "Activity Logs", href: "/team/activity" },
    ],
  },
  {
    key: "ai-automation",
    label: "AI & Automation",
    icon: Bot,
    children: [
      { label: "K2KAI Studio", href: "/ai" },
      { label: "AI Reply Assistant", href: "/inbox" },
      { label: "Caption Generator", href: "/ai" },
      { label: "Workflow Automation", href: "/automation" },
      { label: "Automation Logs", href: "/automation" },
    ],
  },
  {
    key: "insights",
    label: "Insights",
    icon: BarChart3,
    children: [
      { label: "Analytics Dashboard", href: "/insights/analytics" },
      { label: "Reach", href: "/insights/analytics" },
      { label: "Engagement", href: "/engagement" },
      { label: "Audience", href: "/insights/analytics" },
      { label: "Reports", href: "/insights/reports" },
      { label: "Live Analytics", href: "/insights/analytics" },
    ],
  },
  {
    key: "inbox",
    label: "Inbox",
    icon: Inbox,
    children: [
      { label: "Unified Inbox", href: "/inbox" },
      { label: "Messages", href: "/messages" },
      { label: "Comments", href: "/social/comments" },
      { label: "Mentions", href: "/inbox" },
      { label: "Reviews", href: "/inbox" },
      { label: "AI Replies", href: "/inbox" },
    ],
    expandable: false,
  },
  {
    key: "administration",
    label: "Administration",
    icon: ShieldCheck,
    children: [
      { label: "Company Profile", href: "/dashboard/settings" },
      { label: "Workspace Settings", href: "/dashboard/settings" },
      { label: "API Connections", href: "/settings/social" },
      { label: "User Management", href: "/dashboard/users" },
      { label: "Security", href: "/settings/account" },
      { label: "Audit Logs", href: "/administration/audit" },
      { label: "Notifications", href: "/notifications" },
      { label: "Backup & Restore", href: "/administration/backup" },
      { label: "System Health", href: "/dashboard" },
    ],
  },
];
