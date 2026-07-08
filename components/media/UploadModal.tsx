"use client";

import { motion } from "framer-motion";

type UploadModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function UploadModal({ open, onClose }: UploadModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-sm font-semibold text-white">Upload Asset</div>
        <div className="mt-2 text-xs text-white/60">Cloudinary/AWS S3 adapter coming soon.</div>
        <div className="mt-3 space-y-2">
          <input className="h-9 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none placeholder:text-white/40" placeholder="Asset name" />
          <select className="h-9 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none">
            <option>Image</option>
            <option>Video</option>
            <option>Document</option>
          </select>
          <input className="h-9 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none placeholder:text-white/40" placeholder="Tags" />
          <input className="h-9 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none placeholder:text-white/40" placeholder="Campaign" />
          <input className="h-9 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none placeholder:text-white/40" placeholder="Folder" />
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white">Cancel</button>
          <button onClick={onClose} className="rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white">Upload</button>
        </div>
      </motion.div>
    </div>
  );
}
