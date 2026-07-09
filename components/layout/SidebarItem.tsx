"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type SidebarItemProps = {
  isActive?: boolean;
  icon?: LucideIcon;
  label: string;
  href?: string;
  subitem?: boolean;
  onClick?: () => void;
};

export default function SidebarItem({ isActive, icon, label, subitem, onClick }: SidebarItemProps) {
  return (
    <motion.button
      whileHover={subitem ? {} : { scale: 1.01, y: -1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      onClick={onClick}
      className={[
        "relative flex w-full items-center rounded-lg px-3 py-2 text-left transition-colors duration-300",
        subitem ? "ml-1 border border-transparent" : "border border-white/10 bg-white/[0.04] hover:bg-white/[0.08]",
        isActive ? "bg-sky-900/25 text-sky-300" : "text-white/70 hover:text-white",
      ].join(" ")}
    >
      {icon && !subitem && (
        <span className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05]">
          {(() => { const ActiveIcon = icon; return <ActiveIcon className="h-4 w-4" strokeWidth={1.8} />; })()}
        </span>
      )}
      <span className={`font-medium ${subitem ? "text-xs" : "text-sm"}`}>{label}</span>
      {isActive && (
        <span className="absolute left-1.5 top-1/2 h-6 w-[4px] -translate-y-1/2 rounded-r bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
      )}
    </motion.button>
  );
}
