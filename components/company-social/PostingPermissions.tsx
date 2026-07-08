"use client";

import { motion } from "framer-motion";
import type { PostingPermissionItem } from "@/types/company-social";

type PostingPermissionsProps = {
  items: PostingPermissionItem[];
};

export default function PostingPermissions({ items }: PostingPermissionsProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Posting Permissions</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item, index) => (
          <motion.span
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white"
          >
            {item.label} {item.requiresApproval ? "• Approval Required" : ""}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
