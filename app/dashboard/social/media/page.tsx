"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Upload, FolderPlus, RefreshCw, Search, Star, Clock, Image as ImageIcon, Video,
  FileText, Shield, Megaphone, Target,
  Package, FolderKanban, CalendarDays, Archive, Trash2,
} from "lucide-react";
import DamFolderSidebar from "@/components/media/DamFolderSidebar";
import DamKpiCards from "@/components/media/DamKpiCards";
import DamAssetCard from "@/components/media/DamAssetCard";
import DamUploadModal from "@/components/media/DamUploadModal";
import DamDetailDrawer from "@/components/media/DamDetailDrawer";
import DamStoragePanel from "@/components/media/DamStoragePanel";
import DamActivityTimeline from "@/components/media/DamActivityTimeline";
import DamBulkBar from "@/components/media/DamBulkBar";

const FILTER_CHIPS = [
  { id: "IMAGE", label: "Images" },
  { id: "VIDEO", label: "Videos" },
  { id: "DOCUMENT", label: "Documents" },
  { id: "LOGO", label: "Logo" },
  { id: "BRAND_ASSET", label: "Brand" },
  { id: "recent", label: "Recent" },
  { id: "favorite", label: "Favorites" },
  { id: "archived", label: "Archived" },
];
const SORTS = [
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "name", label: "Name" },
  { id: "largest", label: "Largest" },
  { id: "mostUsed", label: "Most Used" },
];

export default function MediaLibraryPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [activeFolder, setActiveFolder] = useState<string>(""); // "" all, or slug/__favorites/__trash/__recent
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerAsset, setDrawerAsset] = useState<any>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (typeFilter && !["recent", "favorite", "archived"].includes(typeFilter)) params.set("type", typeFilter);
    if (activeFolder) params.set("folderId", activeFolder);
    if (typeFilter === "favorite") params.set("favorite", "1");
    if (typeFilter === "archived") params.set("archived", "1");
    params.set("sort", sort);
    const [a, s, ac] = await Promise.all([
      fetch(`/api/media?${params}`).then((r) => r.json()),
      fetch(`/api/media?view=stats`).then((r) => r.json()),
      fetch(`/api/media?view=activity&limit=15`).then((r) => r.json()),
    ]);
    setAssets(a.assets ?? []);
    setStats(s.stats ?? null);
    setActivity(ac.activity ?? []);
    setLoading(false);
  }, [search, typeFilter, activeFolder, sort]);

  const loadFolders = useCallback(async () => {
    const f = await fetch(`/api/media/folders`).then((r) => r.json());
    setFolders(f.folders ?? []);
  }, []);

  useEffect(() => { loadFolders(); }, [loadFolders]);
  useEffect(() => { loadAll(); }, [loadAll]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const refresh = () => { loadAll(); loadFolders(); };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    await fetch(`/api/media/folders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newFolderName }) });
    setNewFolderName(""); setShowNewFolder(false); loadFolders();
  };

  const folderCount = useMemo(() => {
    const map: Record<string, number> = {};
    assets.forEach((a) => { const k = a.folderId || "root"; map[k] = (map[k] || 0) + 1; });
    return map;
  }, [assets]);

  return (
    <div className="flex h-[calc(100vh-5.5rem)] gap-4">
      {/* LEFT: folders */}
      <DamFolderSidebar
        folders={folders}
        activeFolder={activeFolder}
        onSelect={setActiveFolder}
        folderCount={folderCount}
        totalAssets={stats?.total ?? 0}
        favorites={stats?.favorites ?? 0}
        recent={stats?.recentUploads ?? 0}
        archived={stats?.archived ?? 0}
        trashed={stats?.trashed ?? 0}
        onNewFolder={() => setShowNewFolder(true)}
      />

      {/* CENTER */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white">Company Media Library</h1>
            <p className="text-xs text-white/55">Manage all official company media assets from one secure location.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowUpload(true)} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 px-3 py-2 text-xs font-semibold text-white">
              <Upload className="h-4 w-4" /> Upload Files
            </button>
            <button onClick={() => setShowNewFolder(true)} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10">
              <FolderPlus className="h-4 w-4" /> Create Folder
            </button>
            <button onClick={refresh} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <DamKpiCards stats={stats} />

        {/* Search + filters */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <Search className="h-4 w-4 text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by filename, tags, uploader, folder…"
              className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/40"
            />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 outline-none">
            {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {FILTER_CHIPS.map((c) => (
            <button key={c.id} onClick={() => setTypeFilter(typeFilter === c.id ? "" : c.id)}
              className={`rounded-full border px-3 py-1 text-[11px] transition ${typeFilter === c.id ? "border-sky-400/40 bg-sky-400/10 text-white" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"}`}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Bulk bar */}
        {selected.size > 0 && (
          <DamBulkBar count={selected.size} onClear={() => setSelected(new Set())}
            onAction={async (action: string, opts: any) => {
              await fetch(`/api/media/bulk`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: Array.from(selected), action, ...opts }) });
              setSelected(new Set()); refresh();
            }} />
        )}

        {/* Grid */}
        <div className="mt-3 flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-56 animate-pulse rounded-2xl bg-white/5" />)}
            </div>
          ) : assets.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-3 rounded-3xl border border-white/10 bg-white/[0.03] p-6"><ImageIcon className="h-10 w-10 text-white/30" /></div>
              <div className="text-sm text-white/70">No media assets available.</div>
              <button onClick={() => setShowUpload(true)} className="mt-3 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 px-3 py-2 text-xs font-semibold text-white">
                <Upload className="h-4 w-4" /> Upload
              </button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {assets.map((a, i) => (
                <DamAssetCard key={a.id} asset={a} index={i}
                  selected={selected.has(a.id)}
                  onSelect={() => toggleSelect(a.id)}
                  onOpen={() => setDrawerAsset(a)}
                  onToggleFav={async () => { await fetch(`/api/media/${a.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ favorited: !a.favorited }) }); refresh(); }}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* RIGHT: storage + activity */}
      <div className="hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto xl:flex">
        <DamStoragePanel stats={stats} assets={assets} />
        <DamActivityTimeline activity={activity} />
      </div>

      {/* Drawers / modals */}
      {drawerAsset && <DamDetailDrawer asset={drawerAsset} folders={folders} onClose={() => setDrawerAsset(null)} onChanged={refresh} />}
      {showUpload && <DamUploadModal folders={folders} onClose={() => setShowUpload(false)} onDone={() => { setShowUpload(false); refresh(); }} />}

      {showNewFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowNewFolder(false)}>
          <div className="w-80 rounded-2xl border border-white/10 bg-[#0e0f17] p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 text-sm font-semibold text-white">Create Folder</div>
            <input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Folder name"
              className="h-9 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none" />
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={() => setShowNewFolder(false)} className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/70">Cancel</button>
              <button onClick={createFolder} className="rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 px-3 py-1.5 text-xs font-semibold text-white">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
