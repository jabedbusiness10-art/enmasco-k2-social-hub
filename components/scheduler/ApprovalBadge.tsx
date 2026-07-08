"use client";

import { motion } from "framer-motion";
import type { PostStatus } from "@/types/scheduler";

type ApprovalBadgeProps = {
  status?: "PENDING" | "APPROVED" | "REJECTED";
};

export default function ApprovalBadge({ status }: ApprovalBadgeProps) {
  const map = {
    PENDING: "border-amber-500/40 text-amber-200",
    APPROVED: "border-emerald-500/40 text-emerald-200",
    REJECTED: "border-red-500/40 text-red-200",
  };

  if (!status) return null;
  return (
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${map[status]}`}>
      {status}
    </motion.span>
  );
}
