"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { MediaAsset } from "@/types/media";

type MediaCardProps = {
  asset: MediaAsset;
};

export default function MediaCard({ asset }: MediaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.04]"
    >
      <div className="flex aspect-video items-center justify-center bg-white/5 text-xs text-white/60">
        {asset.type === "video" ? "VIDEO" : asset.type.toUpperCase()}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="text-sm font-semibold text-white">{asset.name}</div>
        <div className="text-xs text-white/60">{asset.type} • {asset.size}</div>
        <div className="text-xs text-white/60">Uploaded by {asset.uploadedBy}</div>
        <div className="text-[11px] text-white/60">{asset.uploadedAt}</div>
        <div className="flex flex-wrap gap-1">
          {asset.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70">{tag}</span>
          ))}
        </div>
      </div>
      <button className="absolute right-2 top-2 rounded-full border border-white/10 bg-white/10 p-1 text-white/80 transition hover:text-white">
        <Star className={`h-4 w-4 ${asset.favorite ? "fill-amber-400 text-amber-300" : ""}`} strokeWidth={1.8} />
      </button>
    </motion.div>
  );
}
