"use client";

import { motion } from "framer-motion";
import type { MediaAsset, MediaCategory } from "@/types/media";

type MediaSidebarProps = {
  categories: MediaCategory[];
  selected: MediaCategory;
  onSelect: (category: MediaCategory) => void;
};

const categoryIcon: Record<string, React.ReactNode> = {
  ALL: <Image className="h-4 w-4" strokeWidth={1.8} />,
  IMAGES: <Image className="h-4 w-4" strokeWidth={1.8} />,
  VIDEOS: <PlaySquare className="h-4 w-4" strokeWidth={1.8} />,
  DOCUMENTS: <FileText className="h-4 w-4" strokeWidth={1.8} />,
  BRAND: <Star className="h-4 w-4" strokeWidth={1.8} />,
  CAMPAIGN: <FolderOpen className="h-4 w-4" strokeWidth={1.8} />,
  AI_GENERATED: <Bot className="h-4 w-4" strokeWidth={1.8} />,
  FAVORITES: <Heart className="h-4 w-4" strokeWidth={1.8} />,
  RECENT: <Image className="h-4 w-4" strokeWidth={1.8} />,
  TRASH: <Recycle className="h-4 w-4" strokeWidth={1.8} />,
};

export default function MediaSidebar({ categories, selected, onSelect }: MediaSidebarProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Categories</div>
      <div className="mt-2 space-y-1">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-xs transition ${
              selected === category ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
            }`}
          >
            {categoryIcon[category]}
            {category.replace("_", " ")}
          </button>
        ))}
      </div>
    </div>
  );
}
