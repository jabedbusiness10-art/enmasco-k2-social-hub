"use client";

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

export default function PlannerCalendar() {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-xs text-white/60">
      <div className="flex items-center gap-2 text-white/80">
        <Calendar className="h-4 w-4" strokeWidth={1.8} />
        <span className="font-medium">Calendar Placeholder</span>
      </div>
      <p className="mt-2">Month / Week / Day views will be rendered here with scheduled posts.</p>
    </div>
  );
}
