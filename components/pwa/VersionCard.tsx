"use client";

import { Check, AlertCircle } from "lucide-react";

export default function VersionCard({ version, swActive, updateAvailable }: { version: string; swActive: boolean; updateAvailable: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-white/40">App Version</div>
          <div className="text-xl font-semibold text-white">{version}</div>
        </div>
        <div className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${updateAvailable ? "border-amber-400/30 text-amber-300" : "border-emerald-400/30 text-emerald-300"}`}>
          {updateAvailable ? <AlertCircle className="h-3 w-3" /> : <Check className="h-3 w-3" />}
          {updateAvailable ? "Update available" : "Up to date"}
        </div>
      </div>
      <div className="mt-2 text-xs text-white/40">Service Worker: {swActive ? <span className="text-emerald-300">running</span> : <span className="text-rose-300">not registered</span>}</div>
    </div>
  );
}
