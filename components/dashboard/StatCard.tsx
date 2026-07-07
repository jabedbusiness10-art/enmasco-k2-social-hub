"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  icon: LucideIcon;
  number: number;
  label: string;
  delay?: number;
};

export default function StatCard({
  icon: Icon,
  number,
  label,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.03 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-colors duration-300 hover:border-red-300/30 hover:bg-white/[0.085]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(248,113,113,0.18),transparent_54%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="text-3xl font-semibold leading-none tracking-normal text-white sm:text-4xl">
            {number}
          </div>
          <div className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/60">
            {label}
          </div>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/30 text-red-100 shadow-[0_0_24px_rgba(248,113,113,0.16)] transition-all duration-300 group-hover:border-red-300/40 group-hover:text-white group-hover:shadow-[0_0_32px_rgba(248,113,113,0.32)]">
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>
      </div>
    </motion.div>
  );
}
