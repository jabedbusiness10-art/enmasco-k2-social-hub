"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import type { ScheduledPost } from "@/types/planner";

type ContentQueueProps = {
  posts: ScheduledPost[];
};

export default function ContentQueue({ posts }: ContentQueueProps) {
  const statusClass: Record<string, string> = {
    DRAFT: "border-white/10 text-white/70",
    APPROVED: "border-emerald-500/40 text-emerald-200",
    SCHEDULED: "border-amber-500/40 text-amber-200",
    PUBLISHED: "border-sky-500/40 text-sky-200",
  };

  return (
    <div className="mt-4 space-y-3">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.04 }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-white">{post.title}</div>
              <div className="text-xs text-white/60">{post.platform} • {new Date(post.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
            </div>
            <span className={`inline-flex w-fit items-center rounded-full border px-2 py-1 text-xs font-semibold ${statusClass[post.status] || "border-white/10 text-white/70"}`}>
              {post.status}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
