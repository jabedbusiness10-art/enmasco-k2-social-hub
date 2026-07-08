"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type SidebarItemProps = {
  isActive: boolean;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
};

export default function SidebarItem({ isActive, icon: Icon, label, onClick }: SidebarItemProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={[
        "relative flex items-center w-full px-4 py-3 rounded-lg text-left transition-colors duration-300",
        isActive ? "bg-sky-900/20 text-sky-400" : "text-gray-400 hover:text-gray-200",
        isActive ? "before:absolute before:inset-y-2 before:left-0 before:w-[4px] before:bg-sky-400 before:shadow-[0_0_10px_rgba(56,189,248,0.8)] before:rounded-r-md" : "",
      ].join(" ")}
    >
      <span className="mr-3">
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </span>
      <span className="font-medium">{label}</span>
    </motion.button>
  );
}
