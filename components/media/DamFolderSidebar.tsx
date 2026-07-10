"use client";

import { Star, Clock, Image as ImageIcon, Video, FileText, Shield, Megaphone, Target, Globe, Package, FolderKanban, CalendarDays, Archive, Trash2 } from "lucide-react";

const ICONS: Record<string, any> = {
  Star, Clock, Image: ImageIcon, Video, FileText, Shield, Megaphone, Target, Globe, Package, FolderKanban, CalendarDays, Archive, Trash2,
};

interface Props {
  folders: any[];
  activeFolder: string;
  onSelect: (slug: string) => void;
  folderCount: Record<string, number>;
  totalAssets: number;
  favorites: number;
  recent: number;
  archived: number;
  trashed: number;
  onNewFolder: () => void;
}

const SYSTEM = [
  { key: "", label: "Media Library", icon: "Image", count: "totalAssets" },
  { key: "__favorites", label: "Favorites", icon: "Star", count: "favorites" },
  { key: "__recent", label: "Recent", icon: "Clock", count: "recent" },
  { key: "images", label: "Images", icon: "Image", count: null },
  { key: "videos", label: "Videos", icon: "Video", count: null },
  { key: "documents", label: "Documents", icon: "FileText", count: null },
  { key: "brand-assets", label: "Brand Assets", icon: "Shield", count: null },
  { key: "marketing", label: "Marketing", icon: "Megaphone", count: null },
  { key: "campaigns", label: "Campaigns", icon: "Target", count: null },
  { key: "facebook", label: "Facebook", icon: "Facebook", count: null },
  { key: "instagram", label: "Instagram", icon: "Instagram", count: null },
  { key: "linkedin", label: "LinkedIn", icon: "Linkedin", count: null },
  { key: "youtube", label: "YouTube", icon: "Youtube", count: null },
  { key: "products", label: "Products", icon: "Package", count: null },
  { key: "projects", label: "Projects", icon: "FolderKanban", count: null },
  { key: "events", label: "Events", icon: "CalendarDays", count: null },
  { key: "archives", label: "Archives", icon: "Archive", count: null },
  { key: "__trash", label: "Trash", icon: "Trash2", count: "trashed" },
];

export default function DamFolderSidebar(p: Props) {
  const customBySlug = Object.fromEntries(p.folders.map((f) => [f.slug, f]));
  function countFor(key: string, meta: string | null) {
    if (meta) return (p as any)[meta] as number;
    if (key.startsWith("images")) return p.folderCount; // not accurate; use total fallback
    return undefined;
  }
  return (
    <aside className="hidden w-56 shrink-0 flex-col gap-0.5 overflow-y-auto rounded-3xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl md:flex">
      <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">Folders</div>
      {SYSTEM.map((s) => {
        const custom = customBySlug[s.key];
        const cnt = s.count ? (p as any)[s.count] as number : undefined;
        const Icon = ICONS[s.icon] || ImageIcon;
        const active = p.activeFolder === s.key;
        return (
          <button key={s.key} onClick={() => p.onSelect(s.key)}
            className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm transition ${active ? "bg-gradient-to-r from-sky-500/20 to-rose-500/20 text-white" : "text-white/65 hover:bg-white/5"}`}>
            <span className="flex items-center gap-2.5"><Icon className="h-4 w-4" /> {s.label}</span>
            <span className="text-[11px] text-white/40">{cnt ?? (custom ? p.folderCount[custom.id] ?? 0 : (s.count ? 0 : ""))}</span>
          </button>
        );
      })}
      {p.folders.length > 0 && <div className="my-2 border-t border-white/10" />}
      {p.folders.map((f) => (
        <button key={f.id} onClick={() => p.onSelect(f.slug)}
          className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm transition ${p.activeFolder === f.slug ? "bg-gradient-to-r from-sky-500/20 to-rose-500/20 text-white" : "text-white/65 hover:bg-white/5"}`}>
          <span className="flex items-center gap-2.5"><FolderKanban className="h-4 w-4" /> {f.name}</span>
          <span className="text-[11px] text-white/40">{p.folderCount[f.id] ?? 0}</span>
        </button>
      ))}
      <button onClick={p.onNewFolder} className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-sky-300 hover:bg-white/5">
        + New folder
      </button>
    </aside>
  );
}
