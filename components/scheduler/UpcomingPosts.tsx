"use client";

import { motion } from "framer-motion";
import type { ScheduledPost, PostStatus } from "@/types/scheduler";
import PostCard from "./PostCard";

type Group = {
  key: string;
  title: string;
  posts: ScheduledPost[];
};

export default function UpcomingPosts({
  posts,
  onEdit,
  onDuplicate,
  onDelete,
  onPublishNow,
  onClick,
}: {
  posts: ScheduledPost[];
  onEdit?: (p: ScheduledPost) => void;
  onDuplicate?: (p: ScheduledPost) => void;
  onDelete?: (p: ScheduledPost) => void;
  onPublishNow?: (p: ScheduledPost) => void;
  onClick?: (p: ScheduledPost) => void;
}) {
  const groups: Group[] = [
    {
      key: "UPCOMING",
      title: "Upcoming Posts",
      posts: posts
        .filter((p) => p.status === "SCHEDULED" || p.status === "PUBLISHING")
        .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt)),
    },
    { key: "SCHEDULED", title: "Scheduled Posts", posts: posts.filter((p) => p.status === "SCHEDULED") },
    { key: "PUBLISHED", title: "Published Posts", posts: posts.filter((p) => p.status === "PUBLISHED") },
    { key: "FAILED", title: "Failed Posts", posts: posts.filter((p) => p.status === "FAILED") },
    { key: "DRAFT", title: "Drafts", posts: posts.filter((p) => p.status === "DRAFT") },
  ].filter((g) => g.posts.length > 0);

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <section key={group.key} className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              {group.title}
            </h3>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-white/60">
              {group.posts.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {group.posts.map((post) => (
              <motion.div key={post.id} layout>
                <PostCard
                  post={post}
                  onEdit={onEdit}
                  onDuplicate={onDuplicate}
                  onDelete={onDelete}
                  onPublishNow={onPublishNow}
                  onClick={onClick}
                />
              </motion.div>
            ))}
          </div>
        </section>
      ))}
      {groups.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/50">
          No posts match the current filters.
        </div>
      )}
    </div>
  );
}
