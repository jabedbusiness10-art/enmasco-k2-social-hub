"use client";

import { motion } from "framer-motion";
import { X, ShieldCheck, History, FileBadge } from "lucide-react";
import type { CompanySocialAccount } from "@/types/company-social";
import { PLATFORM_META, STATUS_META } from "@/types/company-social";
import { PLATFORM_UI, statusColorClass, statusDotClass } from "@/lib/social-ui";

export default function AccountDetailModal({
  account,
  onClose,
}: {
  account: CompanySocialAccount;
  onClose: () => void;
}) {
  const meta = PLATFORM_META[account.platform];
  const status = STATUS_META[account.status];
  const ui = PLATFORM_UI[account.platform];

  const rows: [string, string][] = [
    ["Platform", meta.label],
    ["Account Name", account.accountName],
    ["Account ID", account.accountId ?? "—"],
    ["Page ID", account.pageId ?? "—"],
    ["Business Manager", ui.businessManager],
    ["Permissions", "Company Administrator"],
    ["Granted Scopes", ui.scopes.join(", ")],
    ["Token Expiration", account.expiresAt ? new Date(account.expiresAt).toLocaleString() : "Never"],
    ["API Version", ui.apiVersion],
    ["Last Refresh", account.lastSyncAt ? new Date(account.lastSyncAt).toLocaleString() : "—"],
    ["Status", status.label],
  ];

  const audit: [string, string][] = [
    ["Created", new Date(account.createdAt).toLocaleString()],
    ["Updated", new Date(account.updatedAt).toLocaleString()],
    ["Connected By", account.connectedBy],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25 }}
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#0c111d] p-6 shadow-2xl"
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-white/50 hover:text-white">
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black"
            style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
          >
            {meta.label[0]}
          </span>
          <div>
            <h2 className="text-lg font-bold text-white">{account.accountName}</h2>
            <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusColorClass(account.status)}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(account.status)}`} />
              {status.label}
            </span>
          </div>
        </div>

        <Section icon={<FileBadge className="h-4 w-4" />} title="Account Information">
          <dl className="grid grid-cols-1 gap-2">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-white/5 py-1.5 text-xs">
                <dt className="text-white/45">{k}</dt>
                <dd className="max-w-[60%] truncate text-right text-white/85">{v}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section icon={<ShieldCheck className="h-4 w-4" />} title="Granted Scopes">
          <div className="flex flex-wrap gap-1.5">
            {ui.scopes.map((s) => (
              <span key={s} className="rounded-lg border border-sky-400/20 bg-sky-400/10 px-2 py-0.5 text-[10px] text-sky-200">
                {s}
              </span>
            ))}
          </div>
        </Section>

        <Section icon={<History className="h-4 w-4" />} title="Audit Information">
          <dl className="grid grid-cols-1 gap-2">
            {audit.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-white/5 py-1.5 text-xs">
                <dt className="text-white/45">{k}</dt>
                <dd className="text-right text-white/85">{v}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </motion.div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}
