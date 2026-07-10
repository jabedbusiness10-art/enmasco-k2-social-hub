"use client";

import { motion } from "framer-motion";
import { Star, Video, FileText, Image as ImageIcon, MoreVertical } from "lucide-react";

const TYPE_ICON: Record<string, any> = { IMAGE: ImageIcon, VIDEO: Video, DOCUMENT: FileText, LOGO: ImageIcon, BRAND_ASSET: ImageIcon };
const STATUS_COLOR: Record<string, string> = { ACTIVE: "bg-emerald-400", ARCHIVED: "bg-amber-400", TRASHED: "bg-rose-400" };

export function formatBytes(n: number) {
  if (!n) return "0 B";
  const u = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(n) / Math.log(1024));
  return (n / Math.pow(1024, i)).toFixed(i ? 1 : 0) + " " + u[i];
}

export default function DamAssetCard({ asset, index, selected, onSelect, onOpen, onToggleFav }: any) {
  const Icon = TYPE_ICON[asset.fileType] || FileText;
  const isImage = asset.fileType === "IMAGE" || asset.fileType === "LOGO" || asset.fileType === "BRAND_ASSET";
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.02, 0.3) }}
      className={`group relative overflow-hidden rounded-2xl border bg-white/[0.03] shadow-[0_12px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_20px_45px_rgba(56,189,248,0.12)] ${selected ? "border-sky-400/50" : "border-white/10"}`}>
      <div className="flex items-start justify-between p-2">
        <button onClick={onSelect} className={`h-4 w-4 rounded border ${selected ? "border-sky-400 bg-sky-400" : "border-white/30"}`} />
        <button onClick={onToggleFav} className={asset.favorited ? "text-amber-300" : "text-white/30 hover:text-amber-200"}><Star className="h-4 w-4" /></button>
      </div>
      <button onClick={onOpen} className="block w-full px-2">
        <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-xl bg-black/30">
          {isImage && asset.url ? (
            // local upload fallback path
            <img src={asset.url.startsWith("http") ? asset.url : `http://localhost:3000${asset.url}`} alt={asset.originalName}
              className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
          ) : (
            <Icon className="h-10 w-10 text-white/40" />
          )}
          {asset.fileType === "VIDEO" && <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">VIDEO</span>}
          <span className={`absolute left-1 top-1 h-2 w-2 rounded-full ${STATUS_COLOR[asset.status] || "bg-emerald-400"}`} />
        </div>
        <div className="px-1 pb-2 pt-2 text-left">
          <div className="truncate text-xs font-medium text-white">{asset.originalName}</div>
          <div className="mt-0.5 flex items-center justify-between text-[10px] text-white/45">
            <span>{asset.extension?.toUpperCase() || asset.fileType}</span>
            <span>{formatBytes(asset.fileSize)}</span>
          </div>
          <div className="mt-1 truncate text-[10px] text-white/35">{asset.uploadedBy} · {new Date(asset.createdAt).toLocaleDateString()}</div>
          {asset.tags?.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {asset.tags.slice(0, 3).map((t: string) => <span key={t} className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-sky-200">#{t}</span>)}
            </div>
          )}
        </div>
      </button>
    </motion.div>
  );
}
