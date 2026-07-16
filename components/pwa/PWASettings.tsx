"use client";

import { usePWA } from "./PWAProvider";
import { Check, X, Loader2 } from "lucide-react";

function Row({ label, ok, detail }: { label: string; ok: boolean; detail?: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
      <span className="text-sm text-white/70">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/40">{detail}</span>
        {ok ? <Check className="h-4 w-4 text-emerald-400" /> : <X className="h-4 w-4 text-rose-400" />}
      </div>
    </div>
  );
}

export default function PWASettings() {
  const { swActive, installed, online, updateAvailable, cacheSize } = usePWA();
  return (
    <div className="space-y-3">
      <Row label="Installation Status" ok={installed} detail={installed ? "Installed" : "Browser"} />
      <Row label="Service Worker" ok={swActive} detail={swActive ? "Active" : "Inactive"} />
      <Row label="Online / Offline" ok={online} detail={online ? "Online" : "Offline"} />
      <Row label="Update Channel" ok={!updateAvailable} detail={updateAvailable ? "Update pending" : "Up to date"} />
      <Row label="Cache Entries" ok={cacheSize !== null && cacheSize >= 0} detail={cacheSize === null ? "…" : `${cacheSize} items`} />
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-white/40">
        PWA status is computed live in the browser. Protected auth routes are never cached (Security). Storage usage reflects cached static/runtime assets only.
      </div>
    </div>
  );
}
