"use client";

import { motion } from "framer-motion";
import type { CompanyAccount } from "@/types/account-manager";

type PlatformDetailsProps = {
  accounts: CompanyAccount[];
};

export default function PlatformDetails({ accounts }: PlatformDetailsProps) {
  return (
    <div className="space-y-3">
      {accounts.map((account, index) => (
        <motion.div
          key={account.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.04 }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white">{account.platform}</div>
            <span className="text-[11px] text-white/60">{account.lastUpdated}</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-white/80">
            <div>Page: {account.accountName}</div>
            <div>ID: {account.pageId}</div>
            <div>Connected: {account.connectedDate}</div>
            <div>Followers: {account.followers?.toLocaleString() ?? "—"}</div>
            <div>Token: {account.tokenStatus}</div>
            <div>API: {account.apiVersion ?? "—"}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
