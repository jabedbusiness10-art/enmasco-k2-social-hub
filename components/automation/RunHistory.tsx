"use client";

import { motion } from "framer-motion";

export default function RunHistory() {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-xs text-white/60">
      <div className="text-sm font-semibold text-white">Run History</div>
      <p className="mt-2">Detailed run logs will appear here.</p>
    </div>
  );
}
