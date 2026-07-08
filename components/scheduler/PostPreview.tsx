"use client";

import { motion } from "framer-motion";
import type { ScheduledPost } from "@/types/scheduler";

type PostPreviewProps = {
  post: ScheduledPost;
};

export default function PostPreview({ post }: PostPreviewProps) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Post Preview</div>
      <div className="mt-3 space-y-2 text-xs text-white/80">
        <div className="flex justify-between"><span className="text-white/60">Title</span><span className="text-white">{post.title}</span></div>
        <div className="flex justify-between"><span className="text-white/60">Platform</span><span className="text-white">{post.platform}</span></div>
        <div className="flex justify-between"><span className="text-white/60">Caption</span><span className="text-right text-white">{post.caption}</span></div>
        <div className="flex justify-between"><span className="text-white/60">Schedule</span><span className="text-white">{post.scheduledAt}</span></div>
        <div className="flex justify-between"><span className="text-white/60">Owner</span><span className="text-white">{post.owner}</span></div>
        <div className="flex justify-between"><span className="text-white/60">Campaign</span><span className="text-white">{post.campaign ?? "—"}</span></div>
        <div className="flex justify-between"><span className="text-white/60">Tags</span><span className="text-right text-white">{post.tags.join(", ")}</span></div>
      </div>
    </div>
  );
}
