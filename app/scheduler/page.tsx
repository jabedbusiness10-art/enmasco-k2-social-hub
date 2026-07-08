"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SchedulerHeader from "@/components/scheduler/SchedulerHeader";
import SchedulerStats from "@/components/scheduler/SchedulerStats";
import CalendarView from "@/components/scheduler/CalendarView";
import QueueTable from "@/components/scheduler/QueueTable";
import PostPreview from "@/components/scheduler/PostPreview";
import NewPostModal from "@/components/scheduler/NewPostModal";
import FilterPanel from "@/components/scheduler/FilterPanel";
import ApprovalBadge from "@/components/scheduler/ApprovalBadge";
import { posts, kpis } from "@/data/scheduler";
import type { ScheduledPost } from "@/types/scheduler";

export default function SchedulerPage() {
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(posts[0] ?? null);

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <SchedulerHeader onNewPost={() => setNewPostOpen(true)} />
      <div className="mt-4 flex flex-col gap-4 overflow-y-auto px-4">
        <SchedulerStats items={kpis} />
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <aside className="flex flex-col gap-3">
            <CalendarView />
            <FilterPanel />
          </aside>
          <div className="flex flex-col gap-3">
            <QueueTable posts={posts} />
          </div>
          <div className="flex flex-col gap-3">
            {selectedPost ? <PostPreview post={selectedPost} /> : <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-xs text-white/60">Select a post to preview.</div>}
            <div className="flex flex-wrap items-center gap-2">
              <ApprovalBadge status={selectedPost?.approvalStatus} />
              <span className="text-[11px] text-white/50">Approval status shown above if applicable.</span>
            </div>
          </div>
        </section>
      </div>
      <NewPostModal open={newPostOpen} onClose={() => setNewPostOpen(false)} />
    </div>
  );
}
