"use client";

import type { MediaAsset } from "@/types/media";
import MediaCard from "./MediaCard";

type MediaGridProps = {
  assets: MediaAsset[];
  canDelete: boolean;
  onCopy: (url: string) => void;
  onDelete: (asset: MediaAsset) => void;
  onDownload: (asset: MediaAsset) => void;
  onPreview: (asset: MediaAsset) => void;
};

export default function MediaGrid({ assets, canDelete, onCopy, onDelete, onDownload, onPreview }: MediaGridProps) {
  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
        <div className="text-sm font-medium text-white/70">No media found</div>
        <div className="mt-1 text-xs text-white/40">Upload files or adjust your filters.</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {assets.map((asset) => (
        <MediaCard
          key={asset.id}
          asset={asset}
          canDelete={canDelete}
          onCopy={onCopy}
          onDelete={onDelete}
          onDownload={onDownload}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
}
