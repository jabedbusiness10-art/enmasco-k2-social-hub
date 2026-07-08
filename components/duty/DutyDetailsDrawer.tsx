"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Duty } from "@/types/duty";

type DrawerProps = {
  duty: Duty | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function DutyDetailsDrawer({ duty, isOpen, onClose }: DrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && duty && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-white/10 bg-slate-950/80 shadow-2xl backdrop-blur-2xl"
        >
          <div className="flex h-full flex-col gap-5 overflow-y-auto p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Duty Details</h2>
              <button onClick={onClose} className="rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-4 text-sm text-white/80">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Title</div>
                <div className="mt-1 text-white">{duty.title}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Description</div>
                <div className="mt-1 text-white/70">{duty.description}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Assigned To</div>
                  <div className="mt-1 text-white">{duty.assignedTo}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Department</div>
                  <div className="mt-1 text-white">{duty.department}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Priority</div>
                  <div className="mt-1 text-white">{duty.priority}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Status</div>
                  <div className="mt-1 text-white">{duty.status}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Start Date</div>
                  <div className="mt-1 text-white">{duty.startDate}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Due Date</div>
                  <div className="mt-1 text-white">{duty.dueDate}</div>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Attachment</div>
                <div className="mt-1 text-sky-300 underline">{duty.attachment || "None"}</div>
              </div>
            </div>
            <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Progress Timeline</div>
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  Assignment created
                </div>
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <span className="h-2 w-2 rounded-full bg-white/20" />
                  Status updated
                </div>
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <span className="h-2 w-2 rounded-full bg-white/20" />
                  Comments placeholder
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
