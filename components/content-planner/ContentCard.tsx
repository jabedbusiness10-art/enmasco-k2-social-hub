"use client";

import { motion } from "framer-motion";
import { Clock, Image as ImageIcon, Video, LayoutGrid } from "lucide-react";
import type { ContentPlan } from "@/types/contentPlanner";
import PlatformIcon from "./PlatformIcon";
import { StatusBadge } from "./StatusBadge";
import { userById } from "@/data/contentPlanner";

function timeShort(isoStr: string) {
  return new Date(isoStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function ContentCard({
  item,
  onClick,
  compact = false,
}: {
  item: ContentPlan;
  onClick?: () => void;
  compact?: boolean;
}) {
  const assignee = userById(item.assigneeId ?? item.creatorId);
  const MediaIcon = item.media?.type === "VIDEO" ? Video : item.media?.type === "CAROUSEL" ? LayoutGrid : ImageIcon;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="group flex w-full flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.05] p-2.5 text-left shadow-[0_8px_22px_rgba(0,0,0,0.18)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/20"
      style={{ borderLeft: `3px solid ${item.media?.type === "NONE" ? "#64748b" : borderFor(item)}` }}
    >
      <div className="flex items-center justify-between gap-2">
        <PlatformIcon platform={item.platform} size={14} />
        <StatusBadge status={item.status} />
      </div>
      <div className="truncate text-xs font-semibold text-white">{item.title}</div>
      {!compact && (
        <div className="flex items-center gap-1.5 text-[10px] text-white/45">
          <Clock className="h-3 w-3" /> {timeShort(item.schedule.scheduledAt)}
          {item.media && item.media.type !== "NONE" && (
            <span className="flex items-center gap-0.5">
              · <MediaIcon className="h-3 w-3" /> {item.media.type}
            </span>
          )}
        </div>
      )}
      <div className="flex items-center gap-1.5">
        {assignee && (
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
            style={{ background: assignee.color }}
            title={assignee.name}
          >
            {initials(assignee.name)}
          </span>
        )}
        <span className="truncate text-[10px] text-white/45">{assignee?.name ?? "Unassigned"}</span>
      </div>
    </motion.button>
  );
}

function borderFor(item: ContentPlan) {
  const map: Record<string, string> = {
    facebook: "#1877F2",
    instagram: "#E4405F",
    linkedin: "#0A66C2",
    x: "#94a3b8",
    youtube: "#FF0000",
    tiktok: "#FE2C55",
  };
  return map[item.platform] ?? "#64748b";
}
