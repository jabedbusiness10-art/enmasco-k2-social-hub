"use client";

import { motion } from "framer-motion";
import type { MediaAsset } from "@/types/media";

type AssetDetailsProps = {
  asset: MediaAsset;
};

export default function AssetDetails({ asset }: AssetDetailsProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Asset Details</div>
      <div className="mt-3 space-y-2 text-xs text-white/80">
        <div className="flex justify-between"><span className="text-white/60">File Name</span><span className="text-white">{asset.name}</span></div>
        <div className="flex justify-between"><span className="text-white/60">Type</span><span className="text-white">{asset.type}</span></div>
        <div className="flex justify-between"><span className="text-white/60">Size</span><span className="text-white">{asset.size}</span></div>
        <div className="flex justify-between"><span className="text-white/60">Resolution</span><span className="text-white">{asset.resolution ?? "—"}</span></div>
        <div className="flex justify-between"><span className="text-white/60">Dimensions</span><span className="text-white">{asset.dimensions ?? "—"}</span></div>
        <div className="flex justify-between"><span className="text-white/60">Created By</span><span className="text-white">{asset.uploadedBy}</span></div>
        <div className="flex justify-between"><span className="text-white/60">Upload Date</span><span className="text-white">{asset.uploadedAt}</span></div>
        <div className="flex justify-between"><span className="text-white/60">Folder</span><span className="text-white">{asset.folder ?? "—"}</span></div>
        <div className="flex justify-between"><span className="text-white/60">Campaign</span><span className="text-white">{asset.campaign ?? "—"}</span></div>
        <div className="flex justify-between"><span className="text-white/60">Tags</span><span className="text-right text-white">{asset.tags.join(", ")}</span></div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white">Preview</button>
        <button className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white">Download</button>
        <button className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white">Rename</button>
        <button className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white">Move</button>
        <button className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white">Delete</button>
      </div>
    </div>
  );
}
