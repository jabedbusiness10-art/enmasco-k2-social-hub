"use client";

import { motion } from "framer-motion";
import type { Duty } from "@/types/duty";

type DutyTableProps = {
  duties: Duty[];
  onEdit: (duty: Duty) => void;
  onView: (duty: Duty) => void;
};

const priorityClass: Record<string, string> = {
  HIGH: "border-red-500/40 text-red-200",
  MEDIUM: "border-amber-500/40 text-amber-200",
  LOW: "border-emerald-500/40 text-emerald-200",
};

const statusClass: Record<string, string> = {
  PENDING: "border-white/10 text-white/80",
  IN_PROGRESS: "border-sky-500/40 text-sky-200",
  COMPLETED: "border-emerald-500/40 text-emerald-200",
  CANCELLED: "border-white/10 text-white/60",
};

export default function DutyTable({ duties, onEdit, onView }: DutyTableProps) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-white/50">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Assigned To</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {duties.map((duty, index) => (
              <motion.tr
                key={duty.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="transition-colors hover:bg-white/[0.03]"
              >
                <td className="px-4 py-3 font-medium text-white" onClick={() => onView(duty)}>{duty.title}</td>
                <td className="px-4 py-3">{duty.assignedTo}</td>
                <td className="px-4 py-3">{duty.department}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold ${priorityClass[duty.priority] || "border-white/10 text-white/70"}`}>
                    {duty.priority}
                  </span>
                </td>
                <td className="px-4 py-3">{duty.dueDate}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold ${statusClass[duty.status] || "border-white/10 text-white/70"}`}>
                    {duty.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onEdit(duty)}
                    className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/[0.12]"
                  >
                    Edit
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
