"use client";

import { motion } from "framer-motion";
import type { BrandSettings } from "@/types/company-social";

type BrandSettingsProps = {
  settings: BrandSettings;
};

export default function BrandSettings({ settings }: BrandSettingsProps) {
  const entries = [
    ["Company Name", settings.companyName],
    ["Website", settings.website],
    ["Default Language", settings.language],
    ["Default Time Zone", settings.timeZone],
    ["Brand Color", settings.brandColor],
    ["Brand Signature", settings.signature],
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Brand Settings</div>
      <div className="mt-3 space-y-2">
        {entries.map(([label, value], index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
          >
            <div className="text-xs text-white/60">{label}</div>
            <div className="text-xs text-white/80">{value as string}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
