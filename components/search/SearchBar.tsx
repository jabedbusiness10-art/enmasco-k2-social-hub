"use client";

import { Search } from "lucide-react";

export function SearchBar({ value, onChange, inputRef }: { value: string; onChange: (v: string) => void; inputRef?: React.Ref<HTMLInputElement> }) {
  return (
    <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
      <Search className="h-5 w-5 text-white/40" />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search modules, posts, media, people, or type a command…"
        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
        autoFocus
      />
      <kbd className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/40">ESC</kbd>
    </div>
  );
}
