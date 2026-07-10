"use client";

import { Trash2, FolderInput, Archive, Tag, Share2, Copy, X } from "lucide-react";

export default function DamBulkBar({ count, onClear, onAction }: any) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-3 py-2">
      <span className="text-xs font-semibold text-white">{count} selected</span>
      <button onClick={onClear} className="text-white/50 hover:text-white"><X className="h-4 w-4" /></button>
      <div className="flex flex-wrap gap-1.5">
        <B label="Delete" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => onAction("delete")} />
        <B label="Archive" icon={<Archive className="h-3.5 w-3.5" />} onClick={() => onAction("archive")} />
        <B label="Move" icon={<FolderInput className="h-3.5 w-3.5" />} onClick={() => onAction("move")} />
        <B label="Tag" icon={<Tag className="h-3.5 w-3.5" />} onClick={() => onAction("tag", { tags: ["bulk"] })} />
        <B label="Share" icon={<Share2 className="h-3.5 w-3.5" />} onClick={() => onAction("favorite")} />
        <B label="ZIP" icon={<Copy className="h-3.5 w-3.5" />} onClick={() => onAction("tag", { tags: ["zipped"] })} />
      </div>
    </div>
  );
}

function B({ label, icon, onClick }: any) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/85 hover:bg-white/10">
      {icon} {label}
    </button>
  );
}
