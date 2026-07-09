"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import type { MediaAsset } from "@/types/media";

type DeleteDialogProps = {
  asset: MediaAsset | null;
  onClose: () => void;
  onConfirm: (asset: MediaAsset) => Promise<void>;
};

export default function DeleteDialog({ asset, onClose, onConfirm }: DeleteDialogProps) {
  if (!asset) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0c0c0f] p-5"
      >
        <div className="flex items-center gap-2 text-rose-300">
          <AlertTriangle className="h-5 w-5" />
          <span className="text-sm font-semibold">Delete asset?</span>
        </div>
        <p className="mt-2 text-xs text-white/60">
          <span className="text-white">{asset.originalName}</span> will be permanently removed from Cloudinary and the
          library. This cannot be undone.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(asset)}
            className="rounded-lg bg-rose-500/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}
