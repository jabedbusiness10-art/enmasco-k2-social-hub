"use client";

import { motion } from "framer-motion";
import type { CompanySocialAccount } from "@/types/company-social";

type CompanyAccountsProps = {
  accounts: CompanySocialAccount[];
};

const platformLabel: Record<string, string> = {
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  LINKEDIN: "LinkedIn",
  WEBSITE: "Website",
  YOUTUBE: "YouTube",
};

const statusClass: Record<string, string> = {
  CONNECTED: "border-emerald-500/40 text-emerald-200",
  DISCONNECTED: "border-red-500/40 text-red-200",
  WARNING: "border-amber-500/40 text-amber-200",
};

export default function CompanyAccounts({ accounts }: CompanyAccountsProps) {
  return (
    <div className="space-y-3">
      {accounts.map((account, index) => (
        <motion.div
          key={account.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.05 }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">{platformLabel[account.platform] ?? account.platform}</div>
              <div className="text-xs text-white/60">{account.accountName}</div>
              <div className="text-xs text-white/60">ID: {account.businessId}</div>
            </div>
            <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass[account.status] || statusClass.DISCONNECTED}`}>{account.status}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 text-xs text-white">View Details</button>
            <button className="rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 text-xs text-white">Refresh</button>
            <button className="rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 text-xs text-white">Reconnect</button>
            <button className="rounded-lg border border-red-500/20 bg-red-500/5 px-2 py-1 text-xs text-red-200">Disconnect</button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
