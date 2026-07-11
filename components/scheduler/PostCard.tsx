"use client";

import { motion } from "framer-motion";
import { Pencil, Copy, Trash2, Send } from "lucide-react";
import type { ScheduledPost } from "@/types/scheduler";
import { PLATFORMS } from "./platformMeta";
import { PlatformIcon } from "./PlatformSelector";
import StatusBadge from "./StatusBadge";
import { fmtDate, fmtTime } from "./dateUtils";

type PostCardProps = {
  post: ScheduledPost;
  onEdit?: (post: ScheduledPost) => void;
  onDuplicate?: (post: ScheduledPost) => void;
  onDelete?: (post: ScheduledPost) => void;
  onPublishNow?: (post: ScheduledPost) => void;
  onClick?: (post: ScheduledPost) => void;
};

export default function PostCard({
  post,
  onEdit,
  onDuplicate,
  onDelete,
  onPublishNow,
  onClick,
}: PostCardProps) {
  const meta = PLATFORMS[post.platform];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      onClick={() => onClick?.(post)}
      className="group cursor-pointer rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.25)] transition-all duration-300 hover:border-red-500/30 hover:shadow-[0_0_44px_rgba(248,113,113,0.14)]"
    >
      <div className="flex gap-3">
        <div
          className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 ${meta.soft}`}
        >
          {post.mediaUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.mediaUrl}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <PlatformIcon platform={post.platform} />
          )}
          <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-md border border-white/15 bg-black/60">
            <PlatformIcon platform={post.platform} />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="truncate text-sm font-semibold text-white">{post.title}</h4>
            <StatusBadge status={post.status} />
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-white/55">{post.caption}</p>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-white/45">
            <span className={meta.text}>{meta.label}</span>
            <span className="text-white/25">•</span>
            <span>{fmtDate(post.scheduledAt)}</span>
            <span className="text-white/25">•</span>
            <span>{fmtTime(post.scheduledAt)}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-3">
        <Action label="Edit" icon={Pencil} onClick={() => onEdit?.(post)} />
        <Action label="Duplicate" icon={Copy} onClick={() => onDuplicate?.(post)} />
        <Action label="Delete" icon={Trash2} danger onClick={() => onDelete?.(post)} />
        <Action label="Publish" icon={Send} accent onClick={() => onPublishNow?.(post)} />
      </div>
    </motion.div>
  );
}

function Action({
  label,
  icon: Icon,
  onClick,
  danger,
  accent,
}: {
  label: string;
  icon: typeof Pencil;
  onClick?: () => void;
  danger?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition-all duration-200 ${
        danger
          ? "border-red-500/25 text-red-300 hover:bg-red-500/10"
          : accent
            ? "border-red-500/30 text-red-200 hover:bg-red-500/15"
            : "border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
      {label}
    </button>
  );
}
