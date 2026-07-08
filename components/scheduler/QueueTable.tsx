"use client";

import { motion } from "framer-motion";
import type { ScheduledPost } from "@/types/scheduler";

type QueueTableProps = {
  posts: ScheduledPost[];
};

const statusClass: Record<string, string> = {
  DRAFT: "border-white/20 text-white/80",
  PENDING_APPROVAL: "border-amber-500/40 text-amber-200",
  APPROVED: "border-sky-500/40 text-sky-200",
  SCHEDULED: "border-violet-500/40 text-violet-200",
  PUBLISHED: "border-emerald-500/40 text-emerald-200",
  FAILED: "border-red-500/40 text-red-200",
};

export default function QueueTable({ posts }: QueueTableProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04]">
      <div className="border-b border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/60">Scheduled Queue</div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-white/60">
              <th className="px-3 py-2">Time</th>
              <th className="px-3 py-2">Platform</th>
              <th className="px-3 py-2">Content</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Owner</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {posts.map((post, index) => (
              <motion.tr
                key={post.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="text-white/80"
              >
                <td className="px-3 py-2">{post.scheduledAt}</td>
                <td className="px-3 py-2 uppercase">{post.platform}</td>
                <td className="px-3 py-2">{post.title}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full border px-2 py-1 ${statusClass[post.status] || statusClass.DRAFT}`}>{post.status}</span>
                </td>
                <td className="px-3 py-2 text-white/60">{post.owner}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white hover:bg-white/10">Edit</button>
                    <button className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white hover:bg-white/10">Cancel</button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
