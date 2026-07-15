"use client";

import { Highlight } from "./SearchHighlight";
import type { SearchResult } from "@/hooks/useCommandPalette";
import type { LucideIcon } from "lucide-react";

// icon name -> component map (only icons we use)
import {
  LayoutDashboard, Crown, Network, Film, Folder, Tag, Inbox, Bot, Layers, Bell,
  Settings, PenLine, Upload, FolderPlus, TagPlus, Sparkles, Image as ImageIcon,
  Globe, RefreshCw, FileDown, RotateCw, LogOut, Compass, Search, Clock,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard, Crown, Network, Film, Folder, Tag, Inbox, Bot, Layers, Bell,
  Settings, PenLine, Upload, FolderPlus, TagPlus, Sparkles, ImageIcon,
  Globe, RefreshCw, FileDown, RotateCw, LogOut, Compass, Search, Clock,
};

export function CommandList({
  title, items, activeIndex, offset, onHover, query,
}: {
  title: string;
  items: SearchResult[];
  activeIndex: number;
  offset: number;
  onHover: (i: number) => void;
  query: string;
}) {
  if (!items.length) return null;
  return (
    <div className="px-2 py-1">
      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">{title}</div>
      {items.map((it, i) => {
        const Icon = ICONS[it.icon || "Search"] || Search;
        const isActive = activeIndex === offset + i;
        return (
          <button
            key={it.id}
            onMouseEnter={() => onHover(offset + i)}
            data-active={isActive}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
              isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
            }`}
          >
            <Icon className="h-4 w-4 text-sky-300" />
            <span className="flex-1 truncate">
              <Highlight text={it.label} query={query} />
              {it.sub && <span className="ml-2 text-[11px] text-white/35">{it.sub}</span>}
            </span>
            <span className="text-[10px] uppercase text-white/25">{it.category}</span>
          </button>
        );
      })}
    </div>
  );
}
