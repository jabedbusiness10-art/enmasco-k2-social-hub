"use client";

import { Archive, Trash2, ShieldCheck } from "lucide-react";
import { StatusBadge } from "./primitives";

export function RetentionPolicyCard({ policy, onChange }: { policy: { keepLast: number; archiveCritical: boolean; autoCleanup: boolean; active: boolean } | null; onChange: (patch: any) => void }) {
  if (!policy) return <div className="text-sm text-white/40">No retention policy configured.</div>;
  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:grid-cols-4">
      <div>
        <div className="text-xs text-white/40">Keep Last</div>
        <div className="text-lg font-semibold text-white">{policy.keepLast} backups</div>
      </div>
      <div className="flex items-center gap-2">
        <Archive className="h-4 w-4 text-sky-300" />
        <span className="text-sm text-white/70">Archive Critical</span>
        <StatusBadge tone={policy.archiveCritical ? "green" : "gray"}>{policy.archiveCritical ? "ON" : "OFF"}</StatusBadge>
      </div>
      <div className="flex items-center gap-2">
        <Trash2 className="h-4 w-4 text-amber-300" />
        <span className="text-sm text-white/70">Auto Cleanup</span>
        <StatusBadge tone={policy.autoCleanup ? "green" : "gray"}>{policy.autoCleanup ? "ON" : "OFF"}</StatusBadge>
      </div>
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-emerald-300" />
        <span className="text-sm text-white/70">Policy</span>
        <StatusBadge tone={policy.active ? "green" : "gray"}>{policy.active ? "ACTIVE" : "INACTIVE"}</StatusBadge>
      </div>
    </div>
  );
}
