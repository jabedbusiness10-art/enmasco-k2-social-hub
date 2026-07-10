"use client";

import { HardDrive, TrendingUp, Clock, Star } from "lucide-react";
import { formatBytes } from "./DamAssetCard";

const TOTAL = 5 * 1024 * 1024 * 1024; // 5 GB plan (display only)

export default function DamStoragePanel({ stats, assets }: any) {
  const used = stats?.storageBytes ?? 0;
  const pct = Math.min(100, (used / TOTAL) * 100);
  const largest = [...(assets || [])].sort((a: any, b: any) => b.fileSize - a.fileSize).slice(0, 4);
  const mostUsed = [...(assets || [])].sort((a: any, b: any) => (b.usageCount || 0) - (a.usageCount || 0)).slice(0, 4);
  const recent = [...(assets || [])].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white"><HardDrive className="h-4 w-4 text-sky-400" /> Storage</div>
        <div className="mb-1 flex justify-between text-[11px] text-white/60"><span>{formatBytes(used)} used</span><span>{formatBytes(TOTAL)}</span></div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-rose-500" style={{ width: `${pct}%` }} /></div>
        <div className="mt-1 text-right text-[10px] text-white/40">{pct.toFixed(1)}% of plan</div>
      </div>

      <SideList title="Largest Files" icon={<TrendingUp className="h-3.5 w-3.5" />} items={largest} render={(a: any) => `${a.originalName} · ${formatBytes(a.fileSize)}`} />
      <SideList title="Most Used" icon={<Star className="h-3.5 w-3.5" />} items={mostUsed} render={(a: any) => `${a.originalName} · ${a.usageCount || 0}×`} />
      <SideList title="Recently Uploaded" icon={<Clock className="h-3.5 w-3.5" />} items={recent} render={(a: any) => `${a.originalName} · ${new Date(a.createdAt).toLocaleDateString()}`} />
    </>
  );
}

function SideList({ title, icon, items, render }: any) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">{icon} {title}</div>
      <div className="space-y-1">
        {items.length === 0 ? <div className="text-[11px] text-white/30">—</div> :
          items.map((a: any, i: number) => <div key={i} className="truncate text-[11px] text-white/65">{render(a)}</div>)}
      </div>
    </div>
  );
}
