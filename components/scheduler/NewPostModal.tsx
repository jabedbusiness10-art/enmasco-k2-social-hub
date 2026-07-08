"use client";

import { motion } from "framer-motion";
import type { ScheduledPost, PostStatus } from "@/types/scheduler";

type NewPostModalProps = {
  open: boolean;
  onClose: () => void;
};

const platforms = ["facebook", "instagram", "linkedin"] as const;

export default function NewPostModal({ open, onClose }: NewPostModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-sm font-semibold text-white">New Post</div>
        <div className="mt-3 space-y-2">
          <input className="h-9 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none placeholder:text-white/40" placeholder="Post title" />
          <textarea className="h-24 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-white/40" placeholder="Caption" />
          <input className="h-9 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none placeholder:text-white/40" placeholder="Schedule date/time" />
          <input className="h-9 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none placeholder:text-white/40" placeholder="Campaign" />
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white">Save Draft</button>
          <button onClick={onClose} className="rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white">Schedule</button>
        </div>
      </motion.div>
    </div>
  );
}
