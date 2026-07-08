"use client";

import { motion } from "framer-motion";
import { Zap, Timer, CheckCircle2, XCircle, Bot } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

const items = [
  { label: "Active Automations", value: 2, icon: Zap },
  { label: "Scheduled Jobs", value: 1, icon: Timer },
  { label: "Successful Runs", value: 6, icon: CheckCircle2 },
  { label: "Failed Runs", value: 1, icon: XCircle },
  { label: "AI Workflows", value: 1, icon: Bot },
];

export default function AutomationStats() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 14, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
        >
          <GlassCard className="flex items-center gap-3 p-4">
            <item.icon className="h-5 w-5 text-white/70" strokeWidth={1.8} />
            <div>
              <div className="text-2xl font-semibold text-white">{item.value}</div>
              <div className="text-[11px] uppercase tracking-wider text-white/60">{item.label}</div>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}
