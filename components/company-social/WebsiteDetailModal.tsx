"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { WebsiteConnectionPublic } from "@/components/company-social/WebsiteCard";

export default function WebsiteDetailModal({
  conn,
  onClose,
}: {
  conn: WebsiteConnectionPublic;
  onClose: () => void;
}) {
  if (!conn) return null;
  const rows: [string, string][] = [
    ["Website Name", conn.websiteName],
    ["Website URL", conn.websiteUrl],
    ["CMS Type", conn.cmsType],
    ["Status", conn.status],
    ["Health", conn.health],
    ["SSL", conn.sslValid ? "Valid" : "Invalid"],
    ["API Status", conn.apiStatus ? "OK" : "Error"],
    ["Webhook", conn.webhookStatus ? "Configured" : "Error"],
    ["Sync Frequency", conn.syncFrequency],
    ["Last Sync", conn.lastSync ? new Date(conn.lastSync).toLocaleString() : "—"],
    ["Connected By", conn.connectedBy],
    ["Created", new Date(conn.createdAt).toLocaleString()],
    ["Updated", new Date(conn.updatedAt).toLocaleString()],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0b0f] p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Website Connection</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-2">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between border-b border-white/5 pb-2 text-xs">
              <span className="text-white/45">{k}</span>
              <span className="max-w-[60%] truncate text-right font-medium text-white/80">{v}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-white/35">API key &amp; webhook secret are encrypted at rest and never exposed to the client.</p>
      </motion.div>
    </div>
  );
}
