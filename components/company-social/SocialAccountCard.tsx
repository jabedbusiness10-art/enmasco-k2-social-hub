"use client";

import { motion } from "framer-motion";
import { RefreshCw, Unplug, Eye, RotateCw, Loader2 } from "lucide-react";
import type { CompanySocialAccount, SocialPlatform } from "@/types/company-social";
import { PLATFORM_META, STATUS_META } from "@/types/company-social";
import { PLATFORM_UI, statusColorClass, statusDotClass } from "@/lib/social-ui";

function PlatformIcon({ platform, color }: { platform: SocialPlatform; color: string }) {
  const ring = { backgroundColor: `${color}22`, color };
  switch (platform) {
    case "FACEBOOK":
      return (
        <span style={ring} className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-black">
          f
        </span>
      );
    case "INSTAGRAM":
      return (
        <span style={ring} className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-black">
          ◉
        </span>
      );
    case "LINKEDIN":
      return (
        <span style={ring} className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-black">
          in
        </span>
      );
    case "YOUTUBE":
      return (
        <span style={ring} className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-black">
          ▶
        </span>
      );
    case "X":
      return (
        <span style={ring} className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-black">
          X
        </span>
      );
    default:
      return (
        <span style={ring} className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-black">
          ◇
        </span>
      );
  }
}

export default function SocialAccountCard({
  account,
  canManage,
  busy,
  onView,
  onRefresh,
  onReconnect,
  onDisconnect,
}: {
  account: CompanySocialAccount;
  canManage: boolean;
  busy: boolean;
  onView: (a: CompanySocialAccount) => void;
  onRefresh: (id: string) => void;
  onReconnect: (a: CompanySocialAccount) => void;
  onDisconnect: (a: CompanySocialAccount) => void;
}) {
  const meta = PLATFORM_META[account.platform];
  const status = STATUS_META[account.status];
  const ui = PLATFORM_UI[account.platform];
  const pulse = account.status === "CONNECTED";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-colors hover:border-white/20"
    >
      {/* platform color glow */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
        style={{ backgroundColor: meta.color }}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <PlatformIcon platform={account.platform} color={meta.color} />
          {account.companyLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={account.companyLogo}
              alt={account.accountName}
              className="h-11 w-11 rounded-2xl object-cover ring-1 ring-white/10"
            />
          ) : null}
          <div>
            <div className="text-[11px] uppercase tracking-wider text-white/40">{meta.label}</div>
            <div className="text-sm font-semibold text-white">{account.accountName}</div>
            <div className="text-xs text-white/55">
              {account.accountHandle ?? account.username ?? "—"}
            </div>
          </div>
        </div>

        <span
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusColorClass(account.status)}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(account.status)} ${pulse ? "animate-pulse" : ""}`} />
          {status.label}
        </span>
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-white/55">
        <Field label="Account ID" value={account.accountId ?? "—"} />
        <Field label="Page ID" value={account.pageId ?? "—"} />
        <Field label="Org ID" value={account.organizationId ?? account.pageId ?? "—"} />
        <Field label="Last Sync" value={account.lastSyncAt ? new Date(account.lastSyncAt).toLocaleString() : "—"} />
        <Field label="Token Exp." value={account.expiresAt ? new Date(account.expiresAt).toLocaleDateString() : "Never"} />
        <Field label="Connected By" value={account.connectedBy} />
        <Field label="API Version" value={account.apiVersion ?? ui.apiVersion} />
        <Field label="Platform Type" value={ui.platformType} />
        <Field label="Business Mgr" value={ui.businessManager} />
      </div>

      {canManage && (
        <div className="relative mt-4 grid grid-cols-4 gap-2">
          <ActionBtn onClick={() => onView(account)} icon={<Eye className="h-3.5 w-3.5" />} label="Details" />
          <ActionBtn
            onClick={() => onRefresh(account.id)}
            icon={busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            label="Refresh"
          />
          <ActionBtn onClick={() => onReconnect(account)} icon={<RotateCw className="h-3.5 w-3.5" />} label="Reconnect" />
          <ActionBtn
            onClick={() => onDisconnect(account)}
            icon={<Unplug className="h-3.5 w-3.5" />}
            label="Disconnect"
            danger
          />
        </div>
      )}
    </motion.div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wide text-white/35">{label}</div>
      <div className="truncate text-white/75">{value}</div>
    </div>
  );
}

function ActionBtn({
  onClick,
  icon,
  label,
  danger,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 text-[10px] font-medium backdrop-blur transition ${
        danger
          ? "border-red-500/20 bg-red-500/5 text-red-200 hover:bg-red-500/10"
          : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
