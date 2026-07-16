"use client";

import { usePWA } from "./PWAProvider";
import { Download } from "lucide-react";

export default function InstallPrompt() {
  const { canInstall, installed, promptInstall } = usePWA();
  if (installed) return <div className="text-xs text-emerald-300">App is installed. 🎉</div>;
  if (!canInstall) return <div className="text-xs text-white/40">Install prompt not available on this browser. Use the browser menu → “Install app”.</div>;
  return (
    <button onClick={promptInstall} className="flex items-center gap-2 rounded-lg bg-sky-500/80 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500">
      <Download className="h-4 w-4" /> Install Application
    </button>
  );
}
