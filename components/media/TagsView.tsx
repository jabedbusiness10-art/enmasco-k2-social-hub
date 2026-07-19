"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tag, Search, Pencil, Trash2, X, Plus, Merge, Loader2 } from "lucide-react";
import ModalPortal from "@/components/ui/ModalPortal";

interface TagItem { id: string; name: string; color?: string | null; _count?: { assetTags: number }; assetTags?: { length: number } }

export default function TagsView() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#38BDF8");
  const [editing, setEditing] = useState<TagItem | null>(null);
  const [mergeTarget, setMergeTarget] = useState<string>("");
  const [toast, setToast] = useState<string | null>(null);

  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2500); };

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/media/tags");
    const j = await r.json();
    setTags(j.tags ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setName(""); setColor("#38BDF8"); setShowForm(true); };
  const openEdit = (t: TagItem) => { setEditing(t); setName(t.name); setColor(t.color ?? "#38BDF8"); setShowForm(true); };

  const save = async () => {
    if (!name.trim()) return;
    if (editing) {
      await fetch("/api/media/tags", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, name, color }) });
      notify("Tag updated");
    } else {
      await fetch("/api/media/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, color }) });
      notify("Tag created");
    }
    setShowForm(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this tag?")) return;
    await fetch(`/api/media/tags?id=${id}`, { method: "DELETE" });
    notify("Tag deleted");
    load();
  };

  const merge = async () => {
    if (!editing || !mergeTarget || mergeTarget === editing.id) return notify("Pick a different target");
    await fetch("/api/media/tags/merge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fromId: editing.id, toId: mergeTarget }) });
    notify("Tags merged");
    setShowForm(false);
    load();
  };

  const filtered = tags.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2.5">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tags..." className="h-9 w-full rounded-xl border border-white/10 bg-white/[0.06] pl-8 pr-3 text-xs text-white outline-none focus:border-sky-400" />
        </div>
        <button onClick={openCreate} className="flex h-9 items-center gap-1 rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 px-3 text-xs font-semibold text-white"><Plus className="h-3.5 w-3.5" /> New</button>
      </div>

      {loading ? (
        <div className="flex flex-wrap gap-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-white/5" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center text-sm text-white/40">No tags yet. <button onClick={openCreate} className="text-sky-300">Create one</button>.</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {filtered.map((t) => {
            const count = t._count?.assetTags ?? t.assetTags?.length ?? 0;
            return (
              <motion.div key={t.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] py-1.5 pl-2.5 pr-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.color ?? "#38BDF8" }} />
                <span className="text-xs text-white/80">{t.name}</span>
                <span className="rounded-full bg-white/10 px-1.5 text-[10px] text-white/50">{count}</span>
                <button onClick={() => openEdit(t)} className="rounded-full p-1 text-white/40 hover:text-white"><Pencil className="h-3 w-3" /></button>
                <button onClick={() => remove(t.id)} className="rounded-full p-1 text-rose-300/70 hover:text-rose-200"><Trash2 className="h-3 w-3" /></button>
              </motion.div>
            );
          })}
        </div>
      )}

      {showForm && (
        <ModalPortal>
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0e1320] p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-white"><Tag className="h-4 w-4 text-sky-400" /> {editing ? "Edit Tag" : "New Tag"}</div>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tag name" className="mb-3 h-10 w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none focus:border-sky-400" />
            <div className="mb-3 flex items-center gap-3">
              <label className="text-xs text-white/60">Color</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-12 rounded-lg border border-white/10 bg-transparent" />
              <span className="text-xs text-white/40">{color}</span>
            </div>
            {editing && (
              <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <div className="mb-2 text-xs text-white/60">Merge into:</div>
                <select value={mergeTarget} onChange={(e) => setMergeTarget(e.target.value)} className="h-9 w-full rounded-xl border border-white/10 bg-white/[0.06] px-2 text-xs text-white outline-none">
                  <option value="">Select target tag...</option>
                  {tags.filter((t) => t.id !== editing.id).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <button onClick={merge} className="mt-2 flex h-9 w-full items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/5 text-xs text-white/80 hover:bg-white/10"><Merge className="h-3.5 w-3.5" /> Merge</button>
              </div>
            )}
            <button onClick={save} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> {editing ? "Save Changes" : "Create Tag"}</button>
          </div>
        </div>
        </ModalPortal>
      )}

      {toast && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/10 bg-[#0e1320] px-4 py-2 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}
