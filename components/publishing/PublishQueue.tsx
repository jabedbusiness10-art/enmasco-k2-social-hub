"use client";

import { motion } from "framer-motion";
import type { PublishJob } from "@/types/publishing";

type PublishQueueProps = {
  jobs: PublishJob[];
};

const statusClass: Record<string, string> = {
  QUEUED: "border-white/20 text-white/80",
  PUBLISHING: "border-sky-500/40 text-sky-200",
  SUCCESS: "border-emerald-500/40 text-emerald-200",
  FAILED: "border-red-500/40 text-red-200",
  RETRY: "border-amber-500/40 text-amber-200",
  CANCELLED: "border-white/20 text-white/60",
};

export default function PublishQueue({ jobs }: PublishQueueProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04]">
      <div className="border-b border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/60">Publishing Queue</div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-white/60">
              <th className="px-3 py-2">Time</th>
              <th className="px-3 py-2">Platform</th>
              <th className="px-3 py-2">Content</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {jobs.map((job, index) => (
              <motion.tr
                key={job.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="text-white/80"
              >
                <td className="px-3 py-2">{job.scheduledAt}</td>
                <td className="px-3 py-2 uppercase">{job.platform}</td>
                <td className="px-3 py-2">{job.title}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full border px-2 py-1 ${statusClass[job.status] || statusClass.QUEUED}`}>{job.status}</span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white hover:bg-white/10">Retry</button>
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
