/**
 * TASK-61 — Command registry.
 * Each command either navigates (href) or runs a client action (action).
 * `permission` gates admin-only commands (hide for non-admins).
 * No placeholder commands — every action maps to a real module/endpoint.
 */
import type { Permission } from "@/types/auth";
import { hrefForLabel } from "@/lib/search/navigation";

export type CommandAction =
  | { kind: "navigate"; href: string }
  | { kind: "action"; id: string }; // handled in CommandPalette switch

export interface Command {
  id: string;
  label: string;
  hint?: string;
  category: string;
  icon: string; // lucide icon name (mapped in UI)
  keywords?: string[];
  permission?: Permission;
  run: CommandAction;
  pinned?: boolean;
}

export const COMMANDS: Command[] = [
  // Pure navigation results come from NAV_TARGETS; commands are actions only.
  { id: "create-post", label: "Create Post", category: "Create", icon: "PenLine", keywords: ["publish", "compose"], run: { kind: "navigate", href: hrefForLabel("Publishing Scheduler") }, pinned: true },
  { id: "upload-media", label: "Upload Media", category: "Create", icon: "Upload", run: { kind: "action", id: "upload-media" } },
  { id: "create-collection", label: "Create Collection", category: "Create", icon: "FolderPlus", run: { kind: "action", id: "create-collection" } },
  { id: "create-tag", label: "Create Tag", category: "Create", icon: "TagPlus", run: { kind: "action", id: "create-tag" } },
  { id: "ai-caption", label: "Generate AI Caption", category: "AI", icon: "Sparkles", run: { kind: "navigate", href: hrefForLabel("K2Kai Studio") } },
  { id: "ai-image", label: "Generate AI Image", category: "AI", icon: "ImageIcon", run: { kind: "navigate", href: hrefForLabel("K2Kai Studio") } },
  { id: "connect-facebook", label: "Connect Facebook", category: "Connect", icon: "Facebook", run: { kind: "navigate", href: hrefForLabel("Connected Accounts") } },
  { id: "connect-linkedin", label: "Connect LinkedIn", category: "Connect", icon: "Linkedin", run: { kind: "navigate", href: hrefForLabel("Connected Accounts") } },
  { id: "refresh-analytics", label: "Refresh Analytics", category: "Action", icon: "RefreshCw", run: { kind: "action", id: "refresh-analytics" } },
  { id: "export-report", label: "Export Report", category: "Action", icon: "FileDown", run: { kind: "navigate", href: hrefForLabel("Reports") } },
  { id: "restart-queue", label: "Restart Queue Workers", category: "Admin", icon: "RotateCw", permission: "MANAGE_USERS", run: { kind: "action", id: "restart-queue" } },
  { id: "logout", label: "Logout", category: "Action", icon: "LogOut", run: { kind: "action", id: "logout" }, pinned: true },
];
