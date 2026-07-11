import {
  Camera,
  Briefcase,
  MessageCircle,
  Send,
  Music2,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import type { InboxPlatform, ConversationStatus } from "@/types/inbox";

export interface PlatformMeta {
  key: InboxPlatform;
  label: string;
  icon: LucideIcon;
  text: string;
  soft: string;
  solid: string;
  dot: string;
  future?: boolean;
}

export const PLATFORMS: Record<InboxPlatform, PlatformMeta> = {
  facebook: {
    key: "facebook",
    label: "Facebook",
    icon: MessageCircle,
    text: "text-blue-300",
    soft: "bg-blue-500/10",
    solid: "bg-blue-500",
    dot: "bg-blue-400",
  },
  instagram: {
    key: "instagram",
    label: "Instagram",
    icon: Camera,
    text: "text-pink-300",
    soft: "bg-pink-500/10",
    solid: "bg-pink-500",
    dot: "bg-pink-400",
  },
  linkedin: {
    key: "linkedin",
    label: "LinkedIn",
    icon: Briefcase,
    text: "text-sky-300",
    soft: "bg-sky-500/10",
    solid: "bg-sky-500",
    dot: "bg-sky-400",
  },
  x: {
    key: "x",
    label: "X",
    icon: Send,
    text: "text-zinc-200",
    soft: "bg-zinc-500/10",
    solid: "bg-zinc-300",
    dot: "bg-zinc-300",
    future: true,
  },
  tiktok: {
    key: "tiktok",
    label: "TikTok",
    icon: Music2,
    text: "text-cyan-300",
    soft: "bg-cyan-500/10",
    solid: "bg-cyan-400",
    dot: "bg-cyan-400",
    future: true,
  },
  whatsapp: {
    key: "whatsapp",
    label: "WhatsApp",
    icon: MessageSquare,
    text: "text-emerald-300",
    soft: "bg-emerald-500/10",
    solid: "bg-emerald-500",
    dot: "bg-emerald-400",
    future: true,
  },
};

export interface StatusMeta {
  label: string;
  text: string;
  soft: string;
  border: string;
}

export const STATUS_META: Record<ConversationStatus, StatusMeta> = {
  UNREAD: { label: "Unread", text: "text-red-300", soft: "bg-red-500/10", border: "border-red-400/30" },
  REPLIED: { label: "Replied", text: "text-sky-300", soft: "bg-sky-500/10", border: "border-sky-400/30" },
  PENDING: { label: "Pending", text: "text-amber-300", soft: "bg-amber-500/10", border: "border-amber-400/30" },
  RESOLVED: { label: "Resolved", text: "text-emerald-300", soft: "bg-emerald-500/10", border: "border-emerald-400/30" },
  CLOSED: { label: "Closed", text: "text-violet-300", soft: "bg-violet-500/10", border: "border-violet-400/30" },
};

export function initials(name: string): string {
  const clean = name.replace(/^@/, "").trim();
  const parts = clean.split(/[\s_]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
