"use client";

import { motion } from "framer-motion";

type CalendarViewProps = {
  value?: string;
};

export default function CalendarView({ value }: CalendarViewProps = {}) {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Calendar</div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
        {days.map((day, index) => (
          <motion.div
            key={day}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.02 }}
            className={`rounded-xl border px-2 py-2 text-center text-xs ${
              index === 0
                ? "border-sky-500/40 bg-sky-500/10 text-white"
                : "border-white/10 bg-white/5 text-white/70"
            }`}
          >
            <div>{day}</div>
            {index === 0 && <div className="mt-1 text-[11px] text-sky-200">Scheduled: 1</div>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
