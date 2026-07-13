"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight, Megaphone, ShieldAlert, Cloud, Cpu } from "lucide-react";
import { LAYOUT_TOKENS, px } from "@/lib/layout-tokens";

export type InfoItem = {
  id: string;
  category: string;
  icon?: "security" | "cloud" | "ai" | "notice";
  label: string;
  href?: string;
};

/**
 * Enterprise Information Bar — FRAMEWORK ONLY (PART 4).
 * Lives directly below the global header. No live API integration yet; the
 * auto-refresh architecture is wired and ready (swap the stub feed for a real
 * endpoint later). Behavior:
 *  - Renders a rotating/scrolling list of headlines.
 *  - Auto-refresh on an interval (LAYOUT_TOKENS.infoBar.autoRefreshMs).
 *  - Pauses on hover.
 *  - Headlines are clickable (open href in new tab when present).
 *  - Fully responsive (single row, horizontal scroll on narrow widths).
 */
const PLACEHOLDER_FEED: InfoItem[] = [
  { id: "n1", category: "Company", icon: "notice", label: "Welcome to K2KAI Social Flow — your unified enterprise social command center." },
  { id: "n2", category: "Security", icon: "security", label: "Reminder: enable 2FA from Administration → Security to protect your workspace." },
  { id: "n3", category: "Meta", icon: "cloud", label: "Meta Graph API v19.0 is active across connected Facebook & Instagram accounts." },
  { id: "n4", category: "LinkedIn", icon: "cloud", label: "LinkedIn Company Pages integration ready — connect from Social → Connected Accounts." },
  { id: "n5", category: "AI", icon: "ai", label: "K2Kai Studio workflows can be automated from AI & Automation → Workflows." },
];

const ICONS = {
  security: ShieldAlert,
  cloud: Cloud,
  ai: Cpu,
  notice: Megaphone,
} as const;

export default function InfoBar() {
  const [items, setItems] = useState<InfoItem[]>(PLACEHOLDER_FEED);
  const [paused, setPaused] = useState(false);
  const [offset, setOffset] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  // Auto-refresh architecture (PART 4): future — replace readFeed() with a
  // fetch to the info-bar API. Interval pauses while hovered.
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      // rotate the feed one step (placeholder behavior)
      setItems((prev) => (prev.length > 1 ? [...prev.slice(1), prev[0]] : prev));
      setOffset(0);
    }, LAYOUT_TOKENS.infoBar.autoRefreshMs);
    return () => clearInterval(t);
  }, [paused]);

  const height = LAYOUT_TOKENS.infoBar.height;

  return (
    <div
      className="relative z-[45] flex shrink-0 items-center gap-3 overflow-hidden border-b border-white/10 bg-white/[0.02] px-4 backdrop-blur-xl sm:px-5 lg:px-6"
      style={{ height: px(height) }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-label="Enterprise Information Bar"
    >
      <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-sky-200/20 bg-sky-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-200">
        <Megaphone className="h-3 w-3" />
        Updates
      </span>

      <div className="relative flex-1 overflow-hidden">
        <div
          ref={trackRef}
          className="flex items-center gap-8 whitespace-nowrap transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${offset}px)` }}
        >
          {items.map((item) => {
            const Icon = ICONS[item.icon ?? "notice"];
            const content = (
              <span className="flex items-center gap-2 text-[12px] text-white/70">
                <Icon className="h-3.5 w-3.5 text-sky-300/80" />
                <span className="font-semibold text-white/55">{item.category}:</span>
                {item.label}
              </span>
            );
            return item.href ? (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 items-center gap-1 transition hover:text-white"
              >
                {content}
                <ChevronRight className="h-3 w-3 text-white/30" />
              </a>
            ) : (
              <span key={item.id} className="flex shrink-0 items-center">
                {content}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
