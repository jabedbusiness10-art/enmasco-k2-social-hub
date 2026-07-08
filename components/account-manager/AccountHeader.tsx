"use client";

import { motion } from "framer-motion";

type AccountHeaderProps = {
  title: string;
  description: string;
};

export default function AccountHeader({ title, description }: AccountHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3">
      <div>
        <div className="text-lg font-semibold text-white">{title}</div>
        <div className="text-xs text-white/60">{description}</div>
      </div>
    </div>
  );
}
