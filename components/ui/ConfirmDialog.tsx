"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ModalPortal from "@/components/ui/ModalPortal";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <ModalPortal lockScroll={open}>
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ y: 20, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 10, scale: 0.97 }} className="w-full max-w-md rounded-3xl border border-white/10 bg-[#07101f] p-5 shadow-2xl">
            <div className="text-sm font-semibold text-white">{title}</div>
            <div className="mt-1 text-xs text-white/70">{description}</div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={onCancel} className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10">{cancelLabel}</button>
              <button onClick={onConfirm} className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/20">{confirmLabel}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </ModalPortal>
  );
}
