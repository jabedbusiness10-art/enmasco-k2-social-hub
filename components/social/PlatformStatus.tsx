"use client";

import { motion } from "framer-motion";

type PlatformStatusProps = {
  name: string;
  connected: boolean;
};

export default function PlatformStatus({ name, connected }: PlatformStatusProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/80">
      <span>{name}</span>
      <span className={`font-semibold ${connected ? "text-emerald-300" : "text-red-300"}`}>
        {connected ? "Connected" : "Not Connected"}
      </span>
    </div>
  );
}
