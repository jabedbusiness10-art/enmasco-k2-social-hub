"use client";

import { motion } from "framer-motion";

type ActionToolbarProps = {
  onPublishNow: () => void;
  onRetryFailed: () => void;
  onCancelJob: () => void;
  onPauseQueue: () => void;
  onResumeQueue: () => void;
  onViewLogs: () => void;
};

export default function ActionToolbar({ onPublishNow, onRetryFailed, onCancelJob, onPauseQueue, onResumeQueue, onViewLogs }: ActionToolbarProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Manual Actions</div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button onClick={onPublishNow} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white hover:bg-white/10">Publish Now</button>
        <button onClick={onRetryFailed} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white hover:bg-white/10">Retry Failed</button>
        <button onClick={onCancelJob} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white hover:bg-white/10">Cancel Job</button>
        <button onClick={onPauseQueue} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white hover:bg-white/10">Pause Queue</button>
        <button onClick={onResumeQueue} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white hover:bg-white/10">Resume Queue</button>
        <button onClick={onViewLogs} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white hover:bg-white/10">View Logs</button>
      </div>
    </div>
  );
}
