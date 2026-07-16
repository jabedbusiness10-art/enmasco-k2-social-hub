"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { usePWA } from "./PWAProvider";

export default function CacheManager() {
  const { cacheSize } = usePWA();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const clear = async () => {
    setBusy(true);
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      setDone(true);
    } finally { setBusy(false); }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-white/70">Cache Management</div>
          <div className="text-xs text-white/40">{cacheSize === null ? "—" : `${cacheSize} cached entries`} · clear to force fresh assets</div>
        </div>
        <button onClick={clear} disabled={busy} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-rose-300 hover:bg-white/5 disabled:opacity-40">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Clear Cache
        </button>
      </div>
      {done && <div className="mt-2 text-xs text-emerald-300">Cache cleared. Reload to rebuild.</div>}
    </div>
  );
}
