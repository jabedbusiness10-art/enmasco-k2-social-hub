"use client";

import { motion } from "framer-motion";

const skeleton = "animate-pulse rounded-2xl bg-white/[0.06]";

export default function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className={`h-4 w-40 ${skeleton}`} />
      <div className={`h-64 w-full ${skeleton}`} />
    </div>
  );
}
