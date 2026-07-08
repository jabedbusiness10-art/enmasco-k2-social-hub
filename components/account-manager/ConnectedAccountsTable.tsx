"use client";

import { motion } from "framer-motion";
import type { CompanyAccount } from "@/types/account-manager";

type ConnectedAccountsTableProps = {
  accounts: CompanyAccount[];
};

const statusClass: Record<string, string> = {
  CONNECTED: "border-emerald-500/40 text-emerald-200",
  WARNING: "border-amber-500/40 text-amber-200",
  DISCONNECTED: "border-red-500/40 text-red-200",
};

export default function ConnectedAccountsTable({ accounts }: ConnectedAccountsTableProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04]">
      <div className="border-b border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/60">Connected Accounts</div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-white/60">
              <th className="px-3 py-2">Platform</th>
              <th className="px-3 py-2">Account</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Last Sync</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {accounts.map((account, index) => (
              <motion.tr
                key={account.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="text-white/80"
              >
                <td className="px-3 py-2 font-semibold text-white">{account.platform}</td>
                <td className="px-3 py-2">{account.accountName}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full border px-2 py-1 ${statusClass[account.status] || statusClass.DISCONNECTED}`}>{account.status}</span>
                </td>
                <td className="px-3 py-2 text-white/60">{account.lastSync}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 text-white hover:bg-white/10">View</button>
                    <button className="rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 text-white hover:bg-white/10">Refresh</button>
                    <button className="rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 text-white hover:bg-white/10">Disable</button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
