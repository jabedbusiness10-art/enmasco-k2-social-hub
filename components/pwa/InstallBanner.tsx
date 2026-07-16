"use client";

import { usePWA } from "./PWAProvider";
import { Download, X } from "lucide-react";

export default function InstallBanner() {
  const { canInstall, installed, promptInstall } = usePWA();
  if (installed || !canInstall) return null;
  return (
    <div className="fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-white/10 bg-[#0a0a14]/95 px-4 py-3 shadow-xl backdrop-blur">
      <Download className="h-5 w-5 text-sky-300" />
      <div className="text-sm text-white/80">Install K2KAI Social Flow for faster, offline-ready access.</div>
      <button onClick={promptInstall} className="rounded-lg bg-sky-500/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-500">Install</button>
    </div>
  );
}
