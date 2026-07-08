"use client";

import { motion } from "framer-motion";

type PlatformSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function PlatformSelector({ value, onChange }: PlatformSelectorProps) {
  const platforms = ["facebook", "instagram", "linkedin"];
  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map((platform) => (
        <button
          key={platform}
          onClick={() => onChange(platform)}
          className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
            value === platform ? "border-white/20 bg-white/15 text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
          }`}
        >
          {platform}
        </button>
      ))}
    </div>
  );
}
