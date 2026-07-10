"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Star, Trash2, Pencil, X, Loader2 } from "lucide-react";

interface Prompt { id: string; title: string; prompt: string; category: string; favorite: boolean; }

export default function PromptLibrary() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Prompt | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [promptText, setPromptText] = useState("");
  const [category, setCategory] = useState("General");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/ai/prompts");
    const json = await res.json();
    setPrompts(json.prompts ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setTitle(""); setPromptText(""); setCategory("General"); setShowForm(true); }
  function openEdit(p: Prompt) { setEditing(p); setTitle(p.title); setPromptText(p.prompt); setCategory(p.category); setShowForm(true); }

  async function save() {
    if (!title.trim() || !promptText.trim()) return;
    setSaving(true);
    const body = { title, prompt: promptText, category, favorite: editing?.favorite ?? false };
    if (editing) {
      await fetch(`/api/ai/prompts/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch("/api/ai/prompts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    setShowForm(false);
    setSaving(false);
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/ai/prompts/${id}`, { method: "DELETE" });
    await load();
  }

  async function toggleFav(p: Prompt) {
    await fetch(`/api/ai/prompts/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ favorite: !p.favorite }) });
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Saved Prompts ({prompts.length})</div>
        <button onClick={openNew} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 px-3 py-2 text-xs font-semibold text-white">
          <Plus className="h-4 w-4" /> New Prompt
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white">{editing ? "Edit Prompt" : "New Prompt"}</div>
            <button onClick={() => setShowForm(false)} className="text-white/50 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (e.g. CCTV Marketing)" className="h-9 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none placeholder:text-white/40" />
          <textarea value={promptText} onChange={(e) => setPromptText(e.target.value)} rows={4} placeholder="Prompt content..." className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-white/40" />
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="h-9 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none placeholder:text-white/40" />
          <button onClick={save} disabled={saving} className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Save"}
          </button>
        </div>
      )}

      {loading ? (
        <div className="h-24 animate-pulse rounded-2xl bg-white/5" />
      ) : prompts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center text-xs text-white/40">No prompts yet. Create your first prompt template.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start justify-between">
                <div className="text-sm font-semibold text-white">{p.title}</div>
                <button onClick={() => toggleFav(p)} className={p.favorite ? "text-amber-300" : "text-white/30 hover:text-amber-200"}><Star className="h-4 w-4" /></button>
              </div>
              <div className="mt-1 text-[11px] text-sky-300">{p.category}</div>
              <p className="mt-2 line-clamp-3 text-xs text-white/60">{p.prompt}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => openEdit(p)} className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/80 hover:bg-white/10"><Pencil className="h-3 w-3" /> Edit</button>
                <button onClick={() => remove(p.id)} className="flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/5 px-2 py-1 text-[11px] text-red-200 hover:bg-red-500/10"><Trash2 className="h-3 w-3" /> Delete</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
