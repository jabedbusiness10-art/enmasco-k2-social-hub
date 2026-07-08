"use client";

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

export default function CalendarPlaceholder() {
  return (
    <div className="mt-4 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/60">
      <Calendar className="h-8 w-8 text-white/30" strokeWidth={1.8} />
      <div>
        <div className="text-white font-medium">Calendar View</div>
        <div className="mt-1">This module is a placeholder in Phase-1.</div>
      </div>
    </div>
  );
}
