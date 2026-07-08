"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import MediaHeader from "@/components/media/MediaHeader";
import MediaStats from "@/components/media/MediaStats";
import MediaSidebar from "@/components/media/MediaSidebar";
import MediaCard from "@/components/media/MediaCard";
import AssetDetails from "@/components/media/AssetDetails";
import UploadModal from "@/components/media/UploadModal";
import FilterPanel from "@/components/media/FilterPanel";
import SearchBar from "@/components/media/SearchBar";
import { mediaAssets, mediaCategories, kpis } from "@/data/media";
import type { MediaAsset, MediaCategory } from "@/types/media";

export default function MediaLibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory>("ALL");
  const [query, setQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const filtered = mediaAssets.filter((asset) => {
    const matchesCategory = selectedCategory === "ALL" || asset.category === selectedCategory;
    const matchesQuery = asset.name.toLowerCase().includes(query.toLowerCase()) || asset.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <MediaHeader />
      <div className="mt-4 flex flex-col gap-4 overflow-y-auto px-4">
        <MediaStats stats={kpis} />
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <aside className="flex flex-col gap-3">
            <MediaSidebar categories={mediaCategories} selected={selectedCategory} onSelect={setSelectedCategory} />
            <FilterPanel />
          </aside>
          <div className="flex flex-col gap-3">
            <SearchBar value={query} onChange={setQuery} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((asset) => (
                <MediaCard key={asset.id} asset={asset} onClick={() => setSelectedAsset(asset)} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={() => setUploadOpen(true)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">New Upload</button>
            {selectedAsset ? <AssetDetails asset={selectedAsset} /> : <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-xs text-white/60">Select an asset to view details.</div>}
          </div>
        </section>
      </div>
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
}
