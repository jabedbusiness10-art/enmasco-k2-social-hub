"use client";

import { motion } from "framer-motion";
import { Hash, UserRound, Globe, Megaphone, CalendarClock } from "lucide-react";
import type { ScheduledPost } from "@/types/scheduler";
import { PLATFORMS } from "./platformMeta";
import { PlatformIcon } from "./PlatformSelector";
import StatusBadge from "./StatusBadge";
import { fmtDateTime, relTime } from "./dateUtils";

export default function PostPreview({ post }: { post: ScheduledPost | null }) {
  if (!post) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/50">
        Select a post or calendar event to preview its details.
      </div>
    );
  }
  const meta = PLATFORMS[post.platform];
  return (
    <motion.div
      key={post.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 ${meta.soft}`}>
            <PlatformIcon platform={post.platform} />
          </span>
          <div>
            <div className="text-sm font-semibold text-white">{post.title}</div>
            <div className={`text-xs ${meta.text}`}>{meta.label}</div>
          </div>
        </div>
        <StatusBadge status={post.status} />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-white/75">{post.caption}</p>

      {post.mediaUrl && (
        <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.mediaUrl} alt="" className="h-40 w-full object-cover" />
        </div>
      )}

      {post.hashtags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.hashtags.map((h) => (
            <span
              key={h}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/60"
            >
              <Hash className="h-3 w-3" /> {h}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <Meta icon={Megaphone} label="Scheduled" value={fmtDateTime(post.scheduledAt)} />
        <Meta icon={Globe} label="Timezone" value={post.timezone} />
        <Meta icon={UserRound} label="Owner" value={post.owner} />
        <Meta icon={CalendarClock} label="Relative" value={relTime(post.scheduledAt)} />
      </div>

      {post.campaign && (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/60">
          Campaign: <span className="text-white/85">{post.campaign}</span>
        </div>
      )}
    </motion.div>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Hash;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-2">
      <Icon className="h-3.5 w-3.5 text-white/40" />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
        <div className="truncate text-white/80">{value}</div>
      </div>
    </div>
  );
}

function CalendarDotPlaceholder() {
  return <></>;
}
void CalendarDotPlaceholder;
