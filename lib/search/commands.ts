/**
 * TASK-61 — Command registry.
 * Each command either navigates (href) or runs a client action (action).
 * `permission` gates admin-only commands (hide for non-admins).
 * No placeholder commands — every action maps to a real module/endpoint.
 */
import type { Permission } from "@/types/auth";

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
  // --- Navigation ---
  { id: "go-dashboard", label: "Go to Dashboard", category: "Navigate", icon: "LayoutDashboard", keywords: ["home"], run: { kind: "navigate", href: "/dashboard" }, pinned: true },
  { id: "go-executive", label: "Open Executive Dashboard", category: "Navigate", icon: "Crown", run: { kind: "navigate", href: "/dashboard/executive" } },
  { id: "go-social", label: "Open Social Hub", category: "Navigate", icon: "Network", run: { kind: "navigate", href: "/dashboard/social" } },
  { id: "go-media", label: "Open Media Library", category: "Navigate", icon: "Film", run: { kind: "navigate", href: "/dashboard/media?view=assets" } },
  { id: "go-collections", label: "Open Collections", category: "Navigate", icon: "Folder", run: { kind: "navigate", href: "/dashboard/media?view=collections" } },
  { id: "go-tags", label: "Open Tags", category: "Navigate", icon: "Tag", run: { kind: "navigate", href: "/dashboard/media?view=tags" } },
  { id: "go-inbox", label: "Open Inbox", category: "Navigate", icon: "Inbox", run: { kind: "navigate", href: "/dashboard/inbox/unified" } },
  { id: "go-ai", label: "Open AI Studio", category: "Navigate", icon: "Bot", run: { kind: "navigate", href: "/dashboard/ai/studio" } },
  { id: "go-queue", label: "Open Queue Engine", category: "Navigate", icon: "Layers", run: { kind: "navigate", href: "/dashboard/queue" } },
  { id: "go-notifications", label: "Open Notifications", category: "Navigate", icon: "Bell", run: { kind: "navigate", href: "/dashboard/notifications" } },
  { id: "go-settings", label: "Open Settings", category: "Navigate", icon: "Settings", run: { kind: "navigate", href: "/dashboard/admin/company" } },

  // --- Actions (real) ---
  { id: "create-post", label: "Create Post", category: "Create", icon: "PenLine", keywords: ["publish", "compose"], run: { kind: "navigate", href: "/dashboard/social/publisher" }, pinned: true },
  { id: "upload-media", label: "Upload Media", category: "Create", icon: "Upload", run: { kind: "action", id: "upload-media" } },
  { id: "create-collection", label: "Create Collection", category: "Create", icon: "FolderPlus", run: { kind: "action", id: "create-collection" } },
  { id: "create-tag", label: "Create Tag", category: "Create", icon: "TagPlus", run: { kind: "action", id: "create-tag" } },
  { id: "ai-caption", label: "Generate AI Caption", category: "AI", icon: "Sparkles", run: { kind: "navigate", href: "/dashboard/ai/captions" } },
  { id: "ai-image", label: "Generate AI Image", category: "AI", icon: "ImageIcon", run: { kind: "navigate", href: "/dashboard/ai/studio" } },
  { id: "connect-facebook", label: "Connect Facebook", category: "Connect", icon: "Facebook", run: { kind: "navigate", href: "/dashboard/social/accounts" } },
  { id: "connect-linkedin", label: "Connect LinkedIn", category: "Connect", icon: "Linkedin", run: { kind: "navigate", href: "/dashboard/social/accounts" } },
  { id: "refresh-analytics", label: "Refresh Analytics", category: "Action", icon: "RefreshCw", run: { kind: "action", id: "refresh-analytics" } },
  { id: "export-report", label: "Export Report", category: "Action", icon: "FileDown", run: { kind: "navigate", href: "/dashboard/insights/reports" } },
  { id: "restart-queue", label: "Restart Queue Workers", category: "Admin", icon: "RotateCw", permission: "MANAGE_USERS", run: { kind: "action", id: "restart-queue" } },
  { id: "logout", label: "Logout", category: "Action", icon: "LogOut", run: { kind: "action", id: "logout" }, pinned: true },
];
