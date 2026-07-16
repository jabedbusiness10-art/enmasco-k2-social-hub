"use client";

import { usePWA } from "./PWAProvider";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const { conn } = usePWA();
  if (conn !== "offline") return null;
  return (
    <div className="fixed top-3 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/15 px-4 py-1.5 text-xs text-amber-200 backdrop-blur">
      <WifiOff className="h-4 w-4" /> You are offline — showing cached content.
    </div>
  );
}
