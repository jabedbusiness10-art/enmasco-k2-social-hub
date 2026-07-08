"use client";

import { motion } from "framer-motion";
import { Bell } from "lucide-react";

export default function NotificationBell() {
  return (
    <motion.button whileHover={{ y: -1, scale: 1.05 }} className="relative rounded-lg border border-white/10 bg-white/[0.05] p-2 text-white/70 transition hover:text-white">
      <Bell className="h-4 w-4" strokeWidth={1.8} />
      <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.8)]" />
    </motion.button>
  );
}
