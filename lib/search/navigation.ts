/** Search navigation is generated from the Blueprint v1.1 registry. */
import type { Permission } from "@/types/auth";
import { sidebarConfig } from "@/navigation/sidebarConfig";

export interface NavTarget {
  id: string;
  label: string;
  href: string;
  category: string;
  permission?: Permission;
  keywords?: string[];
}

function targetId(moduleKey: string, label?: string) {
  if (!label) return moduleKey;
  const slug = label
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${moduleKey}-${slug}`;
}

export const NAV_TARGETS: NavTarget[] = sidebarConfig.flatMap((section) => [
  {
    id: targetId(section.key),
    label: section.label,
    href: section.href,
    category: section.label,
    permission: section.permission,
  },
  ...section.children.map((child) => ({
    id: targetId(section.key, child.label),
    label: child.label,
    href: child.href,
    category: section.label,
    permission: child.permission,
  })),
]);

export function hrefForLabel(label: string): string {
  const target = NAV_TARGETS.find((item) => item.label === label);
  if (!target) throw new Error(`Unknown canonical navigation label: ${label}`);
  return target.href;
}

export function filterByRole<T extends { permission?: Permission }>(items: T[], hasPerm: (permission: Permission) => boolean): T[] {
  return items.filter((item) => !item.permission || hasPerm(item.permission));
}
