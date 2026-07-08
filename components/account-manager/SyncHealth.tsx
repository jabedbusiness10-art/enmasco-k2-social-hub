"use client";

import { motion } from "framer-motion";
import type { CompanyAccount } from "@/types/account-manager";

type SyncHealthProps = {
  accounts: CompanyAccount[];
};

const tokenClass: Record<string, string> = {
  Valid: "text-emerald-200",
  "Expires Soon": "text-amber-200",
  N/A: "text-white/60",
};

export default function SyncHealth({ accounts }: SyncHealthProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Sync & Health</div>
      <div className="mt-3 space-y-2">
        {accounts.map((account, index) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
          >
            <div>
              <div className="text-sm font-semibold text-white">{account.platform}</div>
              <div className="text-xs text-white/60">Last sync: {account.lastSync}</div>
            </div>
            <div className="text-xs text-white/60">Next: {account.nextSync ?? "—"}</div>
            <div className={`text-xs font-semibold ${tokenClass[account.tokenStatus] || "text-white"}`}>{account.tokenStatus}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
