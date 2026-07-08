"use client";

import { motion } from "framer-motion";
import type { SocialPost } from "@/types/social";

type SocialFeedProps = {
  posts: SocialPost[];
};

const statusClass: Record<string, string> = {
  DRAFT: "border-white/10 text-white/70",
  SCHEDULED: "border-amber-500/40 text-amber-200",
  PUBLISHED: "border-emerald-500/40 text-emerald-200",
};

export default function SocialFeed({ posts }: SocialFeedProps) {
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
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">{post.platform}</div>
              <div className="mt-1 text-xs text-white/60">{post.caption}</div>
            </div>
            <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold ${statusClass[post.status] || "border-white/10 text-white/70"}`}>
              {post.status}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-white/60">
            <div>{post.publishDate}</div>
            <div className="flex gap-2">
              <button className="rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 transition hover:bg-white/[0.12]">Analytics</button>
              <button className="rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 transition hover:bg-white/[0.12]">Edit</button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
