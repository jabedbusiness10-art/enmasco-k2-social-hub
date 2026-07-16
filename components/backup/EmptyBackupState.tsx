"use client";

import { DatabaseBackup } from "lucide-react";

export function EmptyBackupState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
      <DatabaseBackup className="h-8 w-8 text-white/30" />
      <div className="text-sm font-medium text-white/70">{title}</div>
      {hint && <div className="max-w-sm text-xs text-white/40">{hint}</div>}
    </div>
  );
}
