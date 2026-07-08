"use client";

import { motion } from "framer-motion";

const kpis = [
  { label: "Connected Platforms", value: "3", helper: "Facebook, Instagram, LinkedIn" },
  { label: "Healthy Connections", value: "2", helper: "Only stable connections" },
  { label: "Last Synchronization", value: "02:45 AM", helper: "Approx 2 hrs ago" },
  { label: "Token Warnings", value: "1", helper: "LinkedIn token expiry" },
  { label: "Total Followers", value: "43.82K", helper: "Combined reach" },
  { label: "Next Sync Time", value: "05:45 AM", helper: "Instagram next sync" },
];

export default function AccountCards() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {kpis.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, delay: index * 0.03 }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">{item.label}</div>
          <div className="mt-1 text-2xl font-semibold text-white">{item.value}</div>
          <div className="text-xs text-white/60">{item.helper}</div>
        </motion.div>
      ))}
    </div>
  );
}
