"use client";

import { usePWA } from "./PWAProvider";
import { Wifi, WifiOff, Loader2, AlertTriangle } from "lucide-react";

export default function ConnectionStatus() {
  const { conn, lastSync } = usePWA();
  const map = {
    online: { icon: Wifi, label: "Online", tone: "text-emerald-300" },
    offline: { icon: WifiOff, label: "Offline", tone: "text-amber-300" },
    slow: { icon: AlertTriangle, label: "Slow network", tone: "text-amber-300" },
    reconnecting: { icon: Loader2, label: "Reconnecting…", tone: "text-sky-300" },
  } as const;
  const s = map[conn];
  const Icon = s.icon;
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className={`h-4 w-4 ${s.tone} ${conn === "reconnecting" ? "animate-spin" : ""}`} />
      <span className={s.tone}>{s.label}</span>
      {lastSync && conn === "online" && <span className="text-white/30">· synced {new Date(lastSync).toLocaleTimeString()}</span>}
    </div>
  );
}
