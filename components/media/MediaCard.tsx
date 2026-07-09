"use client";

import { motion } from "framer-motion";
import { Image as ImageIcon, Video, FileText, Star, Copy, Trash2, Download, Eye } from "lucide-react";
import type { MediaAsset } from "@/types/media";

type MediaCardProps = {
  asset: MediaAsset;
  canDelete: boolean;
  onCopy: (url: string) => void;
  onDelete: (asset: MediaAsset) => void;
  onDownload: (asset: MediaAsset) => void;
  onPreview: (asset: MediaAsset) => void;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaCard({ asset, canDelete, onCopy, onDelete, onDownload, onPreview }: MediaCardProps) {
  const isImage = asset.fileType === "IMAGE" || asset.fileType === "LOGO" || asset.fileType === "BRAND_ASSET";
  const isVideo = asset.fileType === "VIDEO";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition hover:border-sky-400/50 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]"
    >
      <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-white/5">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.url} alt={asset.originalName} className="h-full w-full object-cover" />
        ) : isVideo ? (
          <div className="flex flex-col items-center gap-1 text-white/60">
            <Video className="h-10 w-10" />
            <span className="text-[11px]">Video</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-white/60">
            <FileText className="h-10 w-10" />
            <span className="text-[11px]">Document</span>
          </div>
        )}
        <button
          onClick={() => onPreview(asset)}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100"
        >
          <Eye className="h-7 w-7 text-white" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="truncate text-sm font-semibold text-white" title={asset.originalName}>
          {asset.originalName}
        </div>
        <div className="text-xs text-white/60">
          {asset.fileType} • {formatBytes(asset.fileSize)}
        </div>
        <div className="text-[11px] text-white/50">
          by {asset.uploadedBy} • {new Date(asset.createdAt).toLocaleDateString()}
        </div>
        {asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {asset.tags.slice(0, 3).map((t) => (
              <span key={t} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/70">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/10 px-3 py-2">
        <div className="flex gap-1">
          <button onClick={() => onCopy(asset.url)} title="Copy URL" className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/70 hover:text-white">
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onDownload(asset)} title="Download" className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/70 hover:text-white">
            <Download className="h-3.5 w-3.5" />
          </button>
          {canDelete && (
            <button onClick={() => onDelete(asset)} title="Delete" className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-rose-400/80 hover:text-rose-300">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {asset.favorited && <Star className="h-4 w-4 fill-amber-400 text-amber-300" />}
      </div>
    </motion.div>
  );
}
