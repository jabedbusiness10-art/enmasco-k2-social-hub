"use client";

import { cn } from "@/lib/utils";

type LogoBadgeProps = {
  className?: string;
  label?: string;
};

export default function LogoBadge({
  className,
  label = "ENMASCO",
}: LogoBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        "border border-white/10 bg-white/[0.04] backdrop-blur",
        "px-4 py-1.5",
        className
      )}
    >
      <span className="bg-gradient-to-r from-[#3b82f6] to-[#dc2626] bg-clip-text text-sm font-bold uppercase tracking-widest text-transparent">
        {label}
      </span>
    </div>
  );
}
