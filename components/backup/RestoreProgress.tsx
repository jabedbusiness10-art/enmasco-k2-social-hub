"use client";

import { Loader2 } from "lucide-react";

export function RestoreProgress({ restoreId }: { restoreId: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-8">
      <Loader2 className="h-8 w-8 animate-spin text-sky-300" />
      <div className="text-sm text-white/70">Restoring backup…</div>
      <div className="font-mono text-xs text-white/40">job {restoreId.slice(0, 8)}</div>
    </div>
  );
}
