"use client";

import { motion } from "framer-motion";
import { Images, Video, FileText, HardDrive, Star, Archive, Clock } from "lucide-react";

function formatBytes(n: number) {
  if (!n) return "0 B";
  const u = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(n) / Math.log(1024));
  return (n / Math.pow(1024, i)).toFixed(i ? 1 : 0) + " " + u[i];
}

export default function DamKpiCards({ stats }: { stats: any }) {
  const cards = stats ? [
    { l: "Total Assets", v: stats.total, icon: <Images className="h-4 w-4" /> },
    { l: "Images", v: stats.images, icon: <Images className="h-4 w-4" /> },
    { l: "Videos", v: stats.videos, icon: <Video className="h-4 w-4" /> },
    { l: "Documents", v: stats.documents, icon: <FileText className="h-4 w-4" /> },
    { l: "Storage Used", v: formatBytes(stats.storageBytes), icon: <HardDrive className="h-4 w-4" /> },
    { l: "Recent Uploads", v: stats.recentUploads, icon: <Clock className="h-4 w-4" /> },
    { l: "Favorites", v: stats.favorites, icon: <Star className="h-4 w-4" /> },
    { l: "Archived", v: stats.archived, icon: <Archive className="h-4 w-4" /> },
  ] : Array.from({ length: 8 }).map((_, i) => ({ l: "", v: "", icon: null }));

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
      {cards.map((c, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-[0_12px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl">
          <div className="flex items-center gap-1.5 text-white/45">{c.icon}<span className="text-[10px] uppercase tracking-wide">{c.l}</span></div>
          <div className="mt-1 text-lg font-bold text-white">{c.v || (stats ? 0 : "—")}</div>
        </motion.div>
      ))}
    </div>
  );
}
