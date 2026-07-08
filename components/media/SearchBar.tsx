"use client";

import { motion } from "framer-motion";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-64 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-xs text-white outline-none placeholder:text-white/40"
        placeholder="Search assets..."
      />
      <button className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10">Sort</button>
    </div>
  );
}
