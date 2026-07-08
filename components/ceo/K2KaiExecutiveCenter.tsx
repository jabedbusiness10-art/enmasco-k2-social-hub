"use client";

import { motion } from "framer-motion";

type K2KaiExecutiveCenterProps = {
  requests: number;
  popularPrompt: string;
  generatedCaptions: number;
  generatedReports: number;
};

export default function K2KaiExecutiveCenter({ requests, popularPrompt, generatedCaptions, generatedReports }: K2KaiExecutiveCenterProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">K2Kai AI Executive Center</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {[
          ["Today's AI Requests", requests],
          ["Popular Prompt", popularPrompt],
          ["Generated Captions", generatedCaptions],
          ["Generated Reports", generatedReports],
        ].map(([label, value], index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
          >
            <div className="text-[11px] text-white/60">{label}</div>
            <div className="text-sm font-semibold text-white">{value as string}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
