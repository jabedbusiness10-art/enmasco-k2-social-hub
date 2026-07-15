"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FolderPlus, Search, Pencil, Trash2, Star, X, Plus, Layers, Loader2 } from "lucide-react";

interface Collection { id: string; name: string; description?: string | null; parentId: string | null; isPinned: boolean; _count?: { items: number; children: number }; createdAt: string; updatedAt: string; }

export default function CollectionsView() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [editing, setEditing] = useState<Collection | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2500); };

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/media/collections");
    const j = await r.json();
    setCollections(j.collections ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setName(""); setDesc(""); setShowForm(true); };
  const openEdit = (c: Collection) => { setEditing(c); setName(c.name); setDesc(c.description ?? ""); setShowForm(true); };

  const save = async () => {
    if (!name.trim()) return;
    if (editing) {
      await fetch("/api/media/collections", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, name, description: desc }) });
      notify("Collection updated");
    } else {
      await fetch("/api/media/collections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description: desc }) });
      notify("Collection created");
    }
    setShowForm(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this collection? Assets inside are kept.")) return;
    await fetch(`/api/media/collections?id=${id}`, { method: "DELETE" });
    notify("Collection deleted");
    load();
  };

  const filtered = collections.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2.5">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search collections..." className="h-9 w-full rounded-xl border border-white/10 bg-white/[0.06] pl-8 pr-3 text-xs text-white outline-none focus:border-sky-400" />
        </div>
        <div className="flex rounded-xl border border-white/10 bg-white/5 p-0.5">
          {(["grid", "list"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`h-8 rounded-lg px-3 text-xs ${view === v ? "bg-sky-500/20 text-white" : "text-white/50"}`}>{v === "grid" ? "Grid" : "List"}</button>
          ))}
        </div>
        <button onClick={openCreate} className="flex h-9 items-center gap-1 rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 px-3 text-xs font-semibold text-white"><Plus className="h-3.5 w-3.5" /> New</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/5" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center text-sm text-white/40">
          No collections yet. <button onClick={openCreate} className="text-sky-300">Create one</button>.
        </div>
      ) : (
        <div className={view === "list" ? "space-y-2" : "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"}>
          {filtered.map((c) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`group rounded-2xl border border-white/10 bg-white/[0.04] p-3 ${view === "list" ? "flex items-center gap-3" : ""}`}>
              <div className={`flex items-center gap-3 ${view === "list" ? "" : "mb-2"}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-rose-500/20 text-sky-300"><Layers className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-white">{c.name}</div>
                  <div className="text-[10px] text-white/40">{c._count?.items ?? 0} assets · {new Date(c.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              {c.description && <div className="mt-1 truncate text-[11px] text-white/50">{c.description}</div>}
              <div className="mt-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
                <button onClick={() => openEdit(c)} className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/70 hover:text-white"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => remove(c.id)} className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-rose-300 hover:text-rose-200"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0e1320] p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-white"><FolderPlus className="h-4 w-4 text-sky-400" /> {editing ? "Edit Collection" : "New Collection"}</div>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Collection name" className="mb-2 h-10 w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none focus:border-sky-400" />
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description (optional)" rows={3} className="mb-3 w-full rounded-xl border border-white/10 bg-white/[0.06] p-3 text-sm text-white outline-none focus:border-sky-400" />
            <button onClick={save} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> {editing ? "Save Changes" : "Create Collection"}</button>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/10 bg-[#0e1320] px-4 py-2 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}
