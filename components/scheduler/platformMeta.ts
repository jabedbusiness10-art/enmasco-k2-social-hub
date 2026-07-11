import {
  Camera,
  Briefcase,
  MessageCircle,
  Send,
  Music2,
  Image as ImageIcon,
  type LucideIcon,
} from "lucide-react";
import type { PlatformKey, PostStatus } from "@/types/scheduler";

export interface PlatformMeta {
  key: PlatformKey;
  label: string;
  icon: LucideIcon;
  text: string;
  ring: string;
  soft: string;
  future?: boolean;
}

// lucide-react build in this project has no brand glyphs, so we map each
// platform to a distinct generic icon + its brand colour for clear identity.
export const PLATFORMS: Record<PlatformKey, PlatformMeta> = {
  facebook: {
    key: "facebook",
    label: "Facebook",
    icon: MessageCircle,
    text: "text-sky-300",
    ring: "ring-sky-400/40",
    soft: "bg-sky-500/10",
  },
  instagram: {
    key: "instagram",
    label: "Instagram",
    icon: Camera,
    text: "text-rose-300",
    ring: "ring-rose-400/40",
    soft: "bg-rose-500/10",
  },
  linkedin: {
    key: "linkedin",
    label: "LinkedIn",
    icon: Briefcase,
    text: "text-blue-300",
    ring: "ring-blue-400/40",
    soft: "bg-blue-500/10",
  },
  x: {
    key: "x",
    label: "X",
    icon: Send,
    text: "text-white/80",
    ring: "ring-white/30",
    soft: "bg-white/5",
    future: true,
  },
  tiktok: {
    key: "tiktok",
    label: "TikTok",
    icon: Music2,
    text: "text-fuchsia-300",
    ring: "ring-fuchsia-400/40",
    soft: "bg-fuchsia-500/10",
    future: true,
  },
};

export const PLATFORM_LIST = Object.values(PLATFORMS);

export interface StatusMeta {
  label: string;
  badge: string;
  dot: string;
}

export const STATUS_META: Record<PostStatus, StatusMeta> = {
  DRAFT: {
    label: "Draft",
    badge: "border-white/25 bg-white/5 text-white/70",
    dot: "bg-white/60",
  },
  SCHEDULED: {
    label: "Scheduled",
    badge: "border-violet-400/40 bg-violet-500/10 text-violet-200",
    dot: "bg-violet-400",
  },
  PUBLISHING: {
    label: "Publishing",
    badge: "border-sky-400/40 bg-sky-500/10 text-sky-200",
    dot: "bg-sky-400",
  },
  PUBLISHED: {
    label: "Published",
    badge: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
    dot: "bg-emerald-400",
  },
  FAILED: {
    label: "Failed",
    badge: "border-red-400/40 bg-red-500/10 text-red-200",
    dot: "bg-red-400",
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "border-zinc-500/40 bg-zinc-500/10 text-zinc-300",
    dot: "bg-zinc-400",
  },
};

export const MEDIA_FALLBACK = ImageIcon;
