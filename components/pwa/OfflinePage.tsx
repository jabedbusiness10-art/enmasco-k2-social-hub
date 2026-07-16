"use client";

import Link from "next/link";
import { WifiOff, Home } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
        <WifiOff className="mx-auto h-12 w-12 text-amber-300" />
        <h1 className="mt-4 text-2xl font-bold text-white">You are offline</h1>
        <p className="mt-2 max-w-md text-sm text-white/50">
          K2KAI Social Flow needs a connection for live data. Cached dashboards and assets remain available — your queued actions will sync automatically when you reconnect.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <button onClick={() => window.location.reload()} className="rounded-lg bg-sky-500/80 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500">Retry</button>
          <Link href="/dashboard" className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5"><Home className="h-4 w-4" /> Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
