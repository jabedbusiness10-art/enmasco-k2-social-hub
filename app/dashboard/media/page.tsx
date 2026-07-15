"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Grid3x3, List, LayoutGrid, Upload, Search, Star, SlidersHorizontal, Trash2, Archive, X, Layers, Tag as TagIcon } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import DamKpiCards from "@/components/media/DamKpiCards";
import DamFolderSidebar from "@/components/media/DamFolderSidebar";
import DamAssetCard from "@/components/media/DamAssetCard";
import DamDetailDrawer from "@/components/media/DamDetailDrawer";
import DamUploadModal from "@/components/media/DamUploadModal";
import DamBulkBar from "@/components/media/DamBulkBar";
import DamActivityTimeline from "@/components/media/DamActivityTimeline";
import TagManager from "@/components/media/TagManager";
import CollectionSidebar from "@/components/media/CollectionSidebar";
import CollectionsView from "@/components/media/CollectionsView";
import TagsView from "@/components/media/TagsView";
import { formatBytes } from "@/components/media/DamAssetCard";

type Asset = {
  id: string;
  originalName: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  url: string;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  tags: string[];
  description?: string | null;
  status: string;
  favorited: boolean;
  folderId?: string | null;
  createdAt: string;
};

const VIEWS = [
  { id: "grid", label: "Grid", Icon: Grid3x3 },
  { id: "list", label: "List", Icon: List },
  { id: "compact", label: "Compact", Icon: LayoutGrid },
] as const;

const TYPES = ["IMAGE", "VIDEO", "DOCUMENT", "LOGO", "BRAND_ASSET"];

export default function MediaPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const tab = (sp.get("view") as "assets" | "collections" | "tags") || "assets";
  const setTab = (v: "assets" | "collections" | "tags") => {
    router.push(`/dashboard/media?view=${v}`, { scroll: false });
  };

  const [assets, setAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list" | "compact">("grid");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("");
  const [folder, setFolder] = useState<string>("");
  const [selected, setSelected] = useState<string[]>([]);
  const [openAsset, setOpenAsset] = useState<Asset | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [favOnly, setFavOnly] = useState(false);
  const [collection, setCollection] = useState<string | null>(null);
  const [archivedOnly, setArchivedOnly] = useState(false);
  const [unusedOnly, setUnusedOnly] = useState(false);
  const [aiOnly, setAiOnly] = useState(false);
  const [platform, setPlatform] = useState("");
  const [campaign, setCampaign] = useState("");
  const [analytics, setAnalytics] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    if (type) qs.set("type", type);
    if (folder) qs.set("folderId", folder);
    if (collection) qs.set("collectionId", collection);
    if (favOnly) qs.set("favorite", "1");
    if (archivedOnly) qs.set("archived", "1");
    if (unusedOnly) qs.set("unused", "1");
    if (aiOnly) qs.set("ai", "1");
    if (platform) qs.set("platform", platform);
    if (campaign) qs.set("campaign", campaign);
    const [a, s, f, act, an] = await Promise.all([
      fetch(`/api/media?${qs}`).then((r) => r.json()),
      fetch("/api/media?view=stats").then((r) => r.json()),
      fetch("/api/media/folders").then((r) => r.json()),
      fetch("/api/media?view=activity&limit=12").then((r) => r.json()),
      fetch("/api/media?view=analytics").then((r) => r.json()),
    ]);
    setAssets(a.assets ?? []);
    setStats(s.stats ?? null);
    setFolders(f.folders ?? []);
    setActivity(act.activity ?? []);
    setAnalytics(an.analytics ?? null);
    setLoading(false);
  }, [search, type, folder, collection, favOnly, archivedOnly, unusedOnly, aiOnly, platform, campaign]);

  useEffect(() => { load(); }, [load]);

  const toggleSelect = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const toggleFav = async (a: Asset) => {
    await fetch(`/api/media/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorited: !a.favorited }),
    });
    setAssets((p) => p.map((x) => (x.id === a.id ? { ...x, favorited: !a.favorited } : x)));
    load();
  };

  const onBulk = async (action: string, opts: any = {}) => {
    if (action === "restore") {
      for (const id of selected) await fetch(`/api/media/${id}/archive`, { method: "DELETE" });
    } else if (action === "duplicate") {
      await fetch("/api/media/bulk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: selected, action: "duplicate" }) });
    } else if (action === "share") {
      const urls = selected.map((id) => { const a = assets.find((x) => x.id === id); return a ? window.location.origin + a.url : ""; }).filter(Boolean);
      if (navigator.clipboard) await navigator.clipboard.writeText(urls.join("\n"));
    } else if (action === "download") {
      for (const id of selected) { const a = assets.find((x) => x.id === id); if (a) window.open(a.url.startsWith("http") ? a.url : `http://localhost:3000${a.url}`, "_blank"); }
    } else {
      await fetch("/api/media/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected, action, ...opts }),
      });
    }
    setSelected([]);
    load();
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Media Library"
        description="Centralized Digital Asset Management — store, organize, preview, and share every asset."
        actions={
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 px-4 py-2 text-sm font-semibold text-white"
          >
            <Upload className="h-4 w-4" /> Upload
          </button>
        }
      />

      {stats && <DamKpiCards stats={stats} />}

      {analytics && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/45">Monthly Upload Trend</div>
            <div className="flex h-24 items-end gap-1.5">
              {(analytics.monthly || []).map((m: any) => {
                const max = Math.max(1, ...(analytics.monthly || []).map((x: any) => x.count));
                return <div key={m.month} className="flex flex-1 flex-col items-center gap-1" title={`${m.month}: ${m.count} assets`}>
                  <div className="w-full rounded-t bg-gradient-to-t from-sky-500/30 to-sky-400/80" style={{ height: `${Math.max(6, (m.count / max) * 100)}%` }} />
                  <span className="text-[8px] text-white/35">{m.month.slice(2)}</span>
                </div>;
              })}
              {(!analytics.monthly || analytics.monthly.length === 0) && <div className="text-[11px] text-white/40">No data yet.</div>}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/45">Largest Files</div>
            <div className="space-y-1.5">
              {(analytics.largest || []).map((f: any) => (
                <div key={f.id} className="flex items-center justify-between text-[11px]">
                  <span className="truncate text-white/70">{f.originalName}</span>
                  <span className="text-white/45">{formatBytes(f.fileSize)}</span>
                </div>
              ))}
              {(!analytics.largest || analytics.largest.length === 0) && <div className="text-[11px] text-white/40">No files.</div>}
            </div>
            <div className="mt-2 flex gap-3 text-[10px] text-white/45">
              <span>Collections: <b className="text-white/80">{analytics.collections}</b></span>
              <span>Tags: <b className="text-white/80">{analytics.tags}</b></span>
            </div>
          </div>
        </div>
      )}

      {/* View tabs */}
      <div className="flex gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1 w-fit">
        {([{ k: "assets", label: "All Assets", Icon: Grid3x3 }, { k: "collections", label: "Collections", Icon: Layers }, { k: "tags", label: "Tags", Icon: TagIcon }] as const).map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium ${tab === t.k ? "bg-sky-500/20 text-white" : "text-white/55 hover:text-white"}`}>
            <t.Icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "collections" && <CollectionsView />}
      {tab === "tags" && <TagsView />}

      {tab === "assets" && (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr_260px]">
        <DamFolderSidebar
          folders={folders}
          activeFolder={folder}
          onSelect={(id: string) => setFolder(id)}
          folderCount={{}}
          totalAssets={stats?.total ?? assets.length}
          favorites={stats?.favorites ?? 0}
          recent={stats?.recentUploads ?? 0}
          archived={stats?.archived ?? 0}
          trashed={stats?.trashed ?? 0}
          onNewFolder={() => setShowUpload(false)}
        />

        <div className="min-w-0 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2.5">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files, tags, uploader..."
                className="h-9 w-full rounded-xl border border-white/10 bg-white/[0.06] pl-8 pr-3 text-xs text-white outline-none focus:border-sky-400"
              />
            </div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-9 rounded-xl border border-white/10 bg-white/[0.06] px-2 text-xs text-white outline-none"
            >
              <option value="">All Types</option>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <button
              onClick={() => setFavOnly((v) => !v)}
              className={`flex h-9 items-center gap-1 rounded-xl border px-2.5 text-xs ${favOnly ? "border-amber-400/40 bg-amber-400/10 text-amber-200" : "border-white/10 bg-white/5 text-white/60"}`}
            >
              <Star className="h-3.5 w-3.5" /> Fav
            </button>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="h-9 rounded-xl border border-white/10 bg-white/[0.06] px-2 text-xs text-white outline-none">
              <option value="">All Platforms</option>
              {["facebook", "instagram", "linkedin", "youtube", "x"].map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
            </select>
            <button onClick={() => setArchivedOnly((v) => !v)} className={`flex h-9 items-center gap-1 rounded-xl border px-2.5 text-xs ${archivedOnly ? "border-sky-400/40 bg-sky-400/10 text-sky-200" : "border-white/10 bg-white/5 text-white/60"}`}>Archived</button>
            <button onClick={() => setUnusedOnly((v) => !v)} className={`flex h-9 items-center gap-1 rounded-xl border px-2.5 text-xs ${unusedOnly ? "border-sky-400/40 bg-sky-400/10 text-sky-200" : "border-white/10 bg-white/5 text-white/60"}`}>Unused</button>
            <button onClick={() => setAiOnly((v) => !v)} className={`flex h-9 items-center gap-1 rounded-xl border px-2.5 text-xs ${aiOnly ? "border-sky-400/40 bg-sky-400/10 text-sky-200" : "border-white/10 bg-white/5 text-white/60"}`}>AI</button>
            <div className="flex rounded-xl border border-white/10 bg-white/5 p-0.5">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  className={`flex h-8 items-center gap-1 rounded-lg px-2 text-xs ${view === v.id ? "bg-sky-500/20 text-white" : "text-white/50"}`}
                >
                  <v.Icon className="h-3.5 w-3.5" /> {v.label}
                </button>
              ))}
            </div>
          </div>

          {selected.length > 0 && (
            <DamBulkBar
              count={selected.length}
              onClear={() => setSelected([])}
              onAction={onBulk}
            />
          )}

          {/* Grid / List */}
          {loading ? (
            <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
          ) : assets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center text-sm text-white/40">
              No assets yet. Click <span className="text-white/70">Upload</span> to add files.
            </div>
          ) : (
            <div className={view === "list" ? "space-y-2" : "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"}>
              {assets.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.015, 0.3) }}>
                  {view === "list" ? (
                    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                      <input type="checkbox" checked={selected.includes(a.id)} onChange={() => toggleSelect(a.id)} className="h-4 w-4" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm text-white/85">{a.originalName}</div>
                        <div className="text-[10px] text-white/40">{a.fileType} · {(a.fileSize / 1024).toFixed(0)} KB</div>
                      </div>
                      <button onClick={() => toggleFav(a)} className={a.favorited ? "text-amber-300" : "text-white/30"}><Star className="h-4 w-4" /></button>
                      <button onClick={() => setOpenAsset(a)} className="text-white/50 hover:text-white"><SlidersHorizontal className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <DamAssetCard
                      asset={a}
                      index={i}
                      selected={selected.includes(a.id)}
                      onSelect={() => toggleSelect(a.id)}
                      onOpen={() => setOpenAsset(a)}
                      onToggleFav={() => toggleFav(a)}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <CollectionSidebar activeId={collection} onSelect={(id) => setCollection(id)} />
          <TagManager />
        </div>
      </div>
      )}

      {/* Activity */}
      {activity.length > 0 && <DamActivityTimeline activity={activity} />}

      {/* Drawers / Modals */}
      {openAsset && (
        <DamDetailDrawer
          asset={openAsset}
          folders={folders}
          onClose={() => setOpenAsset(null)}
          onChanged={() => { setOpenAsset(null); load(); }}
        />
      )}
      {showUpload && (
        <DamUploadModal folders={folders} onClose={() => setShowUpload(false)} onDone={() => { setShowUpload(false); load(); }} />
      )}
    </div>
  );
}
