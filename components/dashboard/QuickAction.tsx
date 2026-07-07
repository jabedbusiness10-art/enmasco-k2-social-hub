"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

type QuickActionProps = {
  icon: LucideIcon;
  label: string;
  delay?: number;
};

export default function QuickAction({
  icon: Icon,
  label,
  delay = 0,
}: QuickActionProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left backdrop-blur-xl transition hover:border-red-500/30"
    >
      <div className="relative flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] transition group-hover:border-red-500/40 group-hover:bg-red-500/[0.08] text-white/80 group-hover:text-white">
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70 transition group-hover:text-white">
          {label}
        </span>
      </div>

      <div className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)] transition duration-700 group-hover:translate-x-[120%]" />
    </motion.button>
  );
}
