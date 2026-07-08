"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

type QuickActionProps = {
  icon: LucideIcon;
  label: string;
  delay?: number;
};

export default function QuickAction({ icon: Icon, label, delay = 0 }: QuickActionProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="p-5 bg-slate-800 rounded-xl border border-slate-700 cursor-pointer 
                 transition-all duration-300 ease-out
                 hover:border-sky-400 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]
                 group"
    >
      <h3 className="text-lg font-semibold text-gray-100 group-hover:text-sky-400 transition-colors duration-300">
        {label}
      </h3>
      <div className="mt-3 flex items-center gap-2 text-slate-300">
        <Icon className="h-4 w-4" strokeWidth={1.8} />
        <span className="text-sm font-medium">Open</span>
      </div>
    </motion.div>
  );
}
