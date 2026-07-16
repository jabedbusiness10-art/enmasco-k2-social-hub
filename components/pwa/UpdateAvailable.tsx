"use client";

import { usePWA } from "./PWAProvider";
import { RefreshCw } from "lucide-react";

export default function UpdateAvailable() {
  const { updateAvailable, applyUpdate } = usePWA();
  if (!updateAvailable) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/15 px-4 py-3 text-sm text-emerald-200 shadow-xl backdrop-blur">
      <RefreshCw className="h-4 w-4" /> A new version is available.
      <button onClick={applyUpdate} className="rounded-lg bg-emerald-500/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500">Reload</button>
    </div>
  );
}
