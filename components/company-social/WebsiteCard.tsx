"use client";

import { motion } from "framer-motion";
import { RefreshCw, Unplug, Eye, RotateCw, Globe, Loader2 } from "lucide-react";

export interface WebsiteConnectionPublic {
  id: string;
  websiteName: string;
  websiteUrl: string;
  cmsType: string;
  status: "CONNECTED" | "DISCONNECTED" | "ERROR" | "SYNCING";
  online: boolean;
  sslValid: boolean;
  apiStatus: boolean;
  webhookStatus: boolean;
  health: "ONLINE" | "SSL_INVALID" | "API_ERROR" | "WEBHOOK_ERROR" | "OFFLINE";
  lastSync: string | null;
  syncFrequency: string;
  connectedBy: string;
  createdAt: string;
  updatedAt: string;
}

const CMS_COLOR: Record<string, string> = {
  WORDPRESS: "#21759B",
  NEXTJS: "#ffffff",
  CUSTOM: "#38bdf8",
  HEADLESS: "#a78bfa",
  LARAVEL: "#f05340",
  STATIC: "#94A3B8",
};

function healthMeta(health: WebsiteConnectionPublic["health"]) {
  switch (health) {
    case "ONLINE":
      return { label: "Online", cls: "border-emerald-500/40 text-emerald-200", dot: "bg-emerald-400" };
    case "SSL_INVALID":
      return { label: "SSL Invalid", cls: "border-amber-500/40 text-amber-200", dot: "bg-amber-400" };
    case "API_ERROR":
      return { label: "API Error", cls: "border-rose-500/40 text-rose-200", dot: "bg-rose-400" };
    case "WEBHOOK_ERROR":
      return { label: "Webhook Error", cls: "border-rose-500/40 text-rose-200", dot: "bg-rose-400" };
    default:
      return { label: "Offline", cls: "border-red-500/40 text-red-200", dot: "bg-red-400" };
  }
}

export default function WebsiteCard({
  conn,
  canManage,
  busy,
  onView,
  onTest,
  onSync,
  onReconnect,
  onDisconnect,
}: {
  conn: WebsiteConnectionPublic;
  canManage: boolean;
  busy: boolean;
  onView: (c: WebsiteConnectionPublic) => void;
  onTest: (id: string) => void;
  onSync: (id: string) => void;
  onReconnect: (c: WebsiteConnectionPublic) => void;
  onDisconnect: (c: WebsiteConnectionPublic) => void;
}) {
  const color = CMS_COLOR[conn.cmsType] ?? "#38bdf8";
  const h = healthMeta(conn.health);
  const pulse = conn.health === "ONLINE";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-colors hover:border-white/20"
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
        style={{ backgroundColor: color }}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span
            style={{ backgroundColor: `${color}22`, color }}
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-black"
          >
            <Globe className="h-5 w-5" />
          </span>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-white/40">Website · {conn.cmsType}</div>
            <div className="text-sm font-semibold text-white">{conn.websiteName}</div>
            <div className="text-xs text-white/55">{conn.websiteUrl}</div>
          </div>
        </div>

        <span
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${h.cls}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${h.dot} ${pulse ? "animate-pulse" : ""}`} />
          {h.label}
        </span>
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-white/55">
        <Field label="CMS Type" value={conn.cmsType} />
        <Field label="Sync Freq." value={conn.syncFrequency} />
        <Field label="SSL" value={conn.sslValid ? "Valid" : "Invalid"} />
        <Field label="API" value={conn.apiStatus ? "OK" : "Error"} />
        <Field label="Webhook" value={conn.webhookStatus ? "Configured" : "Error"} />
        <Field label="Connected By" value={conn.connectedBy} />
        <Field label="Last Sync" value={conn.lastSync ? new Date(conn.lastSync).toLocaleString() : "—"} />
        <Field label="Health" value={conn.health} />
      </div>

      {canManage && (
        <div className="relative mt-4 grid grid-cols-4 gap-2">
          <ActionBtn onClick={() => onView(conn)} icon={<Eye className="h-3.5 w-3.5" />} label="Details" />
          <ActionBtn
            onClick={() => onTest(conn.id)}
            icon={busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            label="Test"
          />
          <ActionBtn onClick={() => onSync(conn.id)} icon={<RotateCw className="h-3.5 w-3.5" />} label="Sync Now" />
          <ActionBtn
            onClick={() => onDisconnect(conn)}
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
