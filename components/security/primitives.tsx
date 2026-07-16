"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

export function SecCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

export function StatusBadge({ tone, children }: { tone: "green" | "yellow" | "red" | "gray" | "blue"; children: ReactNode }) {
  const map = {
    green: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
    yellow: "bg-amber-400/15 text-amber-300 border-amber-400/30",
    red: "bg-rose-400/15 text-rose-300 border-rose-400/30",
    gray: "bg-white/10 text-white/50 border-white/15",
    blue: "bg-sky-400/15 text-sky-300 border-sky-400/30",
  } as const;
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${map[tone]}`}>{children}</span>;
}

export function AnimatedCard({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }}>
      {children}
    </motion.div>
  );
}
