"use client";

import { AlertTriangle } from "lucide-react";

export function DangerZone({ onTerminateAll, onResetPolicy, loading }: {
  onTerminateAll: () => void; onResetPolicy: () => void; loading?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.04] p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-rose-300">
        <AlertTriangle className="h-4 w-4" /> Danger Zone
      </div>
      <p className="mt-1 text-xs text-white/40">Irreversible security actions. Only administrators can perform these.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={onTerminateAll} disabled={loading}
          className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-200 hover:bg-rose-400/20 disabled:opacity-40">
          Terminate All Other Sessions
        </button>
        <button onClick={onResetPolicy} disabled={loading}
          className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-200 hover:bg-rose-400/20 disabled:opacity-40">
          Reset Password Policy to Defaults
        </button>
      </div>
    </div>
  );
}
