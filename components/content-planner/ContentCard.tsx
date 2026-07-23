"use client";

import { motion } from "framer-motion";
import { Clock, Image as ImageIcon, Video, LayoutGrid } from "lucide-react";
import type { ContentPlan } from "@/types/contentPlanner";
import PlatformIcon from "./PlatformIcon";
import { StatusBadge } from "./StatusBadge";

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
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      whileHover={{ y: -1, transition: { duration: 0.15 } }}
      className="group flex w-full flex-col gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-left shadow-[0_8px_22px_rgba(0,0,0,0.15)] backdrop-blur-md transition hover:border-white/20"
      title={`${item.title}\n${item.schedule.scheduledAt ? new Date(item.schedule.scheduledAt).toLocaleString() : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <PlatformIcon platform={item.platform} size={14} />
        <StatusBadge status={item.status} />
      </div>

      <div className="truncate text-xs font-semibold text-white">{item.title}</div>

      {!compact && (
        <div className="flex items-center gap-1.5 text-[10px] text-white/45">
          <Clock className="h-3 w-3" /> {timeShort(item.schedule.scheduledAt)}
          {item.media?.[0]?.type && (
            <span className="flex items-center gap-0.5 text-white/35">
              · {item.media[0].type}
            </span>
          )}
        </div>
      )}
      <div className="flex items-center gap-1.5 text-[10px] text-white/40">
        <span className="truncate">{item.platform.toUpperCase()}</span>
        <span className="truncate">{item.approval.status}</span>
      </div>
    </motion.button>
  );
}
