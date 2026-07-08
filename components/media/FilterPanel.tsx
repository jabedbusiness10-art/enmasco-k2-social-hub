"use client";

import { motion } from "framer-motion";

export default function FilterPanel() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Filters</div>
      <div className="mt-2 space-y-2">
        <select className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-white outline-none">
          <option>Category</option>
          <option>Brand</option>
          <option>Campaign</option>
        </select>
        <select className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-white outline-none">
          <option>Type</option>
          <option>Image</option>
          <option>Video</option>
          <option>Document</option>
        </select>
        <select className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-white outline-none">
          <option>Uploaded By</option>
          <option>Jabed</option>
          <option>Sara</option>
          <option>MD Kazim</option>
        </select>
        <select className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-white outline-none">
          <option>Favorite</option>
          <option>Yes</option>
          <option>No</option>
        </select>
      </div>
    </div>
  );
}
