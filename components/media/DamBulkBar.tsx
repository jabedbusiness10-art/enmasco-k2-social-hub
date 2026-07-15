"use client";

import { Trash2, FolderInput, Archive, Tag, Share2, Copy, X, RotateCcw, Download, Layers } from "lucide-react";

export default function DamBulkBar({ count, onClear, onAction }: any) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-3 py-2">
      <span className="text-xs font-semibold text-white">{count} selected</span>
      <button onClick={onClear} className="text-white/50 hover:text-white"><X className="h-4 w-4" /></button>
      <div className="flex flex-wrap gap-1.5">
        <B label="Delete" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => onAction("delete")} danger />
        <B label="Archive" icon={<Archive className="h-3.5 w-3.5" />} onClick={() => onAction("archive")} />
        <B label="Restore" icon={<RotateCcw className="h-3.5 w-3.5" />} onClick={() => onAction("restore")} />
        <B label="Move" icon={<FolderInput className="h-3.5 w-3.5" />} onClick={() => onAction("move")} />
        <B label="Tag" icon={<Tag className="h-3.5 w-3.5" />} onClick={() => { const t = prompt("Tag name(s), comma separated"); if (t) onAction("tag", { tags: t.split(",").map((x) => x.trim()).filter(Boolean) }); }} />
        <B label="Collection" icon={<Layers className="h-3.5 w-3.5" />} onClick={() => { const c = prompt("Collection ID to assign"); if (c) onAction("collection", { collectionId: c }); }} />
        <B label="Duplicate" icon={<Copy className="h-3.5 w-3.5" />} onClick={() => onAction("duplicate")} />
        <B label="Download" icon={<Download className="h-3.5 w-3.5" />} onClick={() => onAction("download")} />
        <B label="Share" icon={<Share2 className="h-3.5 w-3.5" />} onClick={() => onAction("share")} />
      </div>
    </div>
  );
}

function B({ label, icon, onClick, danger }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/85 hover:bg-white/10 ${danger ? "text-rose-300" : ""}`}>
      {icon} {label}
    </button>
  );
}
