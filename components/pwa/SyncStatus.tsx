"use client";

import { RefreshCw, CheckCircle2 } from "lucide-react";
import { usePWA } from "./PWAProvider";

export default function SyncStatus() {
  const { online, conn, lastSync } = usePWA();
  const pending = typeof window !== "undefined" ? Number(localStorage.getItem("k2kai-sync-queue") ? JSON.parse(localStorage.getItem("k2kai-sync-queue") || "[]").length : 0) : 0;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-2 flex items-center gap-2 text-sm text-white/70"><RefreshCw className="h-4 w-4 text-sky-300" /> Background Sync</div>
      <div className="text-xs text-white/40">
        {online ? "Connected — queued actions flush immediately." : "Offline — actions queue locally and replay on reconnect (Background Sync ready)."}
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        <span className="text-white/50">{pending} queued · last sync {lastSync ? new Date(lastSync).toLocaleTimeString() : "—"}</span>
      </div>
    </div>
  );
}
