"use client";

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  Database,
  Globe,
  Images,
  Inbox,
  Layers,
  LayoutDashboard,
  MessageCircle,
  Network,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { Permission } from "@/types/auth";
import { NAVIGATION_MODULES } from "./registry.mjs";

export type NavChild = {
  label: string;
  href: string;
  description?: string;
  permission: Permission;
};

export type NavSection = {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
  crumb: string;
  description: string;
  permission: Permission;
  children: NavChild[];
  expandable?: boolean;
};

const ICONS: Record<string, LucideIcon> = {
  Activity,
  BarChart3,
  Bell,
  Bot,
  Database,
  Globe,
  Images,
  Inbox,
  Layers,
  LayoutDashboard,
  MessageCircle,
  Network,
  Settings,
  ShieldCheck,
  Users,
};

/** UI projection of the Blueprint v1.1 registry. Route data lives only in registry.mjs. */
export const sidebarConfig: NavSection[] = NAVIGATION_MODULES.map((section) => ({
  key: section.key,
  label: section.label,
  icon: ICONS[section.icon],
  href: section.href,
  crumb: section.crumb,
  description: section.description,
  permission: section.permission as Permission,
  expandable: section.expandable,
  children: section.children.map((child) => ({
    label: child.label,
    href: child.href,
    description: child.description,
    permission: child.permission as Permission,
  })),
}));

export const dashboardHref = sidebarConfig.find((section) => section.key === "dashboard")?.href ?? "/dashboard";

export type RouteMeta = {
  href: string;
  label: string;
  description?: string;
  permission: Permission;
  moduleKey: string;
  moduleLabel: string;
  moduleHref: string;
  crumb: string;
  breadcrumbs: readonly string[];
};

/** Flat canonical lookup used by breadcrumbs, page headers, and active navigation. */
export const routeMetaMap: Record<string, RouteMeta> = (() => {
  const map: Record<string, RouteMeta> = {};
  for (const section of sidebarConfig) {
    map[section.href] = {
      href: section.href,
      label: section.label,
      description: section.description,
      permission: section.permission,
      moduleKey: section.key,
      moduleLabel: section.label,
      moduleHref: section.href,
      crumb: section.crumb,
      breadcrumbs: section.href === "/dashboard" ? ["Dashboard"] : ["Dashboard", section.crumb],
    };
    for (const child of section.children) {
      map[child.href] = {
        href: child.href,
        label: child.label,
        description: child.description,
        permission: child.permission,
        moduleKey: section.key,
        moduleLabel: section.label,
        moduleHref: section.href,
        crumb: section.crumb,
        breadcrumbs: ["Dashboard", section.crumb, child.label],
      };
    }
  }
  return map;
})();
