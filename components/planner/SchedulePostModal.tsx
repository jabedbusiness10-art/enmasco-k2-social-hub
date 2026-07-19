"use client";

import { motion } from "framer-motion";
import type { ScheduledPost } from "@/types/planner";
import ModalPortal from "@/components/ui/ModalPortal";

type SchedulePostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (post: Omit<ScheduledPost, "id">) => void;
};

export default function SchedulePostModal({ isOpen, onClose, onSchedule }: SchedulePostModalProps) {
  if (!isOpen) return null;

  return (
    <ModalPortal>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.06] p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Schedule Post</div>
            <div className="text-xs text-white/60">Create a new scheduled post.</div>
          </div>
          <button onClick={onClose} className="text-xs text-white/60">Close</button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3">
          <input className="h-9 rounded-xl border border-white/10 bg-white/[0.05] px-3 text-sm text-white" placeholder="Title" />
          <div className="grid grid-cols-2 gap-3">
            <input className="h-9 rounded-xl border border-white/10 bg-white/[0.05] px-3 text-sm text-white" placeholder="Platform" />
            <input className="h-9 rounded-xl border border-white/10 bg-white/[0.05] px-3 text-sm text-white" placeholder="Status" />
          </div>
          <input className="h-9 rounded-xl border border-white/10 bg-white/[0.05] px-3 text-sm text-white" placeholder="Schedule" type="datetime-local" />
          <button
            onClick={() =>
              onSchedule({
                platform: "FACEBOOK",
                title: "New Post",
                scheduledAt: new Date().toISOString(),
                status: "SCHEDULED",
              })
            }
            className="h-9 rounded-xl border border-white/10 bg-white/[0.08] text-xs font-semibold text-white"
          >
            Schedule Post
          </button>
        </div>
      </motion.div>
    </motion.div>
    </ModalPortal>
  );
}
