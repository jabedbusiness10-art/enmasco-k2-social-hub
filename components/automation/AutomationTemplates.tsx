"use client";

import { motion } from "framer-motion";

const templates = [
  "Daily Social Posting",
  "Weekly Report",
  "Auto Caption + Schedule",
  "Campaign Approval",
  "Monthly Analytics",
  "CEO Summary",
];

export default function AutomationTemplates() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Templates</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {templates.map((name, index) => (
          <motion.button
            key={name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            whileHover={{ y: -2, scale: 1.01 }}
            className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/[0.12]"
          >
            {name}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
