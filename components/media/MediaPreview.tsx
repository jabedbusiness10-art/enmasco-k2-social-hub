"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Copy, Download, Star, Pencil } from "lucide-react";
import type { MediaAsset } from "@/types/media";

type MediaPreviewProps = {
  asset: MediaAsset | null;
  canDelete: boolean;
  onClose: () => void;
  onCopy: (url: string) => void;
  onDownload: (asset: MediaAsset) => void;
  onRename: (id: string, name: string) => Promise<void>;
  onToggleFavorite: (asset: MediaAsset) => void;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPreview({
  asset,
  canDelete,
  onClose,
  onCopy,
  onDownload,
  onRename,
  onToggleFavorite,
}: MediaPreviewProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  if (!asset) return null;

  const isImage = asset.fileType === "IMAGE" || asset.fileType === "LOGO" || asset.fileType === "BRAND_ASSET";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0f]"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="text-sm font-semibold text-white">Asset Details</div>
          <button onClick={onClose} className="rounded-lg p-1 text-white/60 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 p-4 md:grid-cols-2">
          <div className="flex items-center justify-center rounded-xl bg-white/5 p-4">
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset.url} alt={asset.originalName} className="max-h-64 rounded-lg object-contain" />
            ) : asset.fileType === "VIDEO" ? (
              <video src={asset.url} controls className="max-h-64 rounded-lg" />
            ) : (
              <a href={asset.url} target="_blank" rel="noreferrer" className="text-xs text-sky-400 underline">
                Open document
              </a>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-white/50">Name:</span>
              {editing ? (
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white outline-none"
                />
              ) : (
                <span className="flex-1 truncate text-white">{asset.originalName}</span>
              )}
              {editing ? (
                <button
                  onClick={async () => {
                    await onRename(asset.id, name);
                    setEditing(false);
                  }}
                  className="rounded-lg bg-sky-500/80 px-2 py-1 text-white"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => {
                    setName(asset.originalName);
                    setEditing(true);
                  }}
                  className="rounded-lg border border-white/10 bg-white/5 p-1 text-white/70 hover:text-white"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Detail label="Type" value={asset.fileType} />
            <Detail label="Size" value={formatBytes(asset.fileSize)} />
            <Detail label="Uploaded by" value={asset.uploadedBy} />
            <Detail label="Uploaded" value={new Date(asset.createdAt).toLocaleString()} />
            {asset.width && asset.height && <Detail label="Dimensions" value={`${asset.width} × ${asset.height}`} />}
            {asset.category && <Detail label="Category" value={asset.category} />}
            {asset.tags.length > 0 && <Detail label="Tags" value={asset.tags.join(", ")} />}

            <div className="flex flex-wrap gap-2 pt-2">
              <button onClick={() => onCopy(asset.url)} className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white/80 hover:text-white">
                <Copy className="h-3.5 w-3.5" /> Copy URL
              </button>
              <button onClick={() => onDownload(asset)} className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white/80 hover:text-white">
                <Download className="h-3.5 w-3.5" /> Download
              </button>
              <button onClick={() => onToggleFavorite(asset)} className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white/80 hover:text-white">
                <Star className={`h-3.5 w-3.5 ${asset.favorited ? "fill-amber-400 text-amber-300" : ""}`} /> Favorite
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-24 shrink-0 text-white/50">{label}:</span>
      <span className="flex-1 break-words text-white">{value}</span>
    </div>
  );
}
