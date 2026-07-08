"use client";

import { motion } from "framer-motion";
import { Download, RefreshCcw } from "lucide-react";

type ExportActionsProps = {
  onExportPdf: () => void;
  onExportExcel: () => void;
  onRefresh: () => void;
};

export default function ExportActions({ onExportPdf, onExportExcel, onRefresh }: ExportActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <motion.button whileHover={{ y: -1, scale: 1.02 }} onClick={onExportPdf} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.12]">
        <Download className="h-4 w-4" strokeWidth={1.8} /> Export PDF
      </motion.button>
      <motion.button whileHover={{ y: -1, scale: 1.02 }} onClick={onExportExcel} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.12]">
        <Download className="h-4 w-4" strokeWidth={1.8} /> Export Excel
      </motion.button>
      <motion.button whileHover={{ y: -1, scale: 1.02 }} onClick={onRefresh} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.12]">
        <RefreshCcw className="h-4 w-4" strokeWidth={1.8} /> Refresh
      </motion.button>
    </div>
  );
}
