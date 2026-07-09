"use client";

import { Search } from "lucide-react";
import type { MediaFileType } from "@/types/media";

type MediaFiltersProps = {
  search: string;
  onSearch: (v: string) => void;
  type: MediaFileType | "";
  onType: (v: MediaFileType | "") => void;
  sort: "newest" | "oldest" | "name";
  onSort: (v: "newest" | "oldest" | "name") => void;
};

const TYPES: { value: MediaFileType | ""; label: string }[] = [
  { value: "", label: "All Types" },
  { value: "IMAGE", label: "Images" },
  { value: "VIDEO", label: "Videos" },
  { value: "DOCUMENT", label: "Documents" },
  { value: "LOGO", label: "Logos" },
  { value: "BRAND_ASSET", label: "Brand Assets" },
];

export default function MediaFilters({ search, onSearch, type, onType, sort, onSort }: MediaFiltersProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by filename or tag..."
          className="h-9 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-white/40 focus:border-sky-400/50"
        />
      </div>
      <select
        value={type}
        onChange={(e) => onType(e.target.value as MediaFileType | "")}
        className="h-9 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none"
      >
        {TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <select
        value={sort}
        onChange={(e) => onSort(e.target.value as "newest" | "oldest" | "name")}
        className="h-9 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="name">Name (A-Z)</option>
      </select>
    </div>
  );
}
