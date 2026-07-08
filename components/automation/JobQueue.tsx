"use client";

import { motion } from "framer-motion";

const statusClass: Record<string, string> = {
  QUEUED: "border-white/20 text-white/80",
  RUNNING: "border-sky-500/40 text-sky-200",
  COMPLETED: "border-emerald-500/40 text-emerald-200",
  FAILED: "border-red-500/40 text-red-200",
  RETRYING: "border-amber-500/40 text-amber-200",
  PAUSED: "border-white/20 text-white/60",
};

type JobQueueProps = {
  jobs: { id: string; workflow: string; status: string; startedAt: string; duration?: string }[];
};

export default function JobQueue({ jobs }: JobQueueProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04]">
      <div className="border-b border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/60">Job Queue</div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-white/60">
              <th className="px-3 py-2">Job ID</th>
              <th className="px-3 py-2">Workflow</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Started</th>
              <th className="px-3 py-2">Duration</th>
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
                <td className="px-3 py-2 text-white">{job.id}</td>
                <td className="px-3 py-2">{job.workflow}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full border px-2 py-1 ${statusClass[job.status] || statusClass.QUEUED}`}>{job.status}</span>
                </td>
                <td className="px-3 py-2">{job.startedAt}</td>
                <td className="px-3 py-2">{job.duration ?? "—"}</td>
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
