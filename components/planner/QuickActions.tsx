"use client";

import { motion } from "framer-motion";
import { Sparkles, Calendar, FolderPlus, Wand2, Upload } from "lucide-react";

const actions = [
  { label: "New Content", icon: FolderPlus },
  { label: "Schedule Post", icon: Calendar },
  { label: "Create Campaign", icon: Sparkles },
  { label: "AI Generate", icon: Wand2 },
  { label: "Import Media", icon: Upload },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((action, index) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.04 }}
          whileHover={{ y: -2, scale: 1.02 }}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 text-xs font-semibold text-white transition hover:bg-white/[0.12]"
        >
          <action.icon className="h-4 w-4" strokeWidth={1.8} />
          {action.label}
        </motion.button>
      ))}
    </div>
  );
}
