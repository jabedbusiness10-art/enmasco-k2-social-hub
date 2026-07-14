"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, X } from "lucide-react";

interface TagItem { id: string; name: string; color?: string | null; }

export default function TagManager() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/media/tags");
    const j = await r.json();
    setTags(j.tags ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!newName.trim()) return;
    await fetch("/api/media/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setNewName("");
    load();
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <Tag className="h-4 w-4 text-sky-400" /> Tags
      </div>
      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="New tag (e.g. Campaign, Product)"
          className="h-9 flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-xs text-white outline-none focus:border-sky-400"
        />
        <button onClick={add} className="flex h-9 items-center gap-1 rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 px-3 text-xs font-semibold text-white">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
      {loading ? (
        <div className="mt-3 h-16 animate-pulse rounded-2xl bg-white/5" />
      ) : (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.length === 0 ? (
            <span className="text-[11px] text-white/35">No tags yet.</span>
          ) : (
            tags.map((t) => (
              <span key={t.id} className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/75">
                <span className="h-2 w-2 rounded-full" style={{ background: t.color ?? "#38BDF8" }} />
                {t.name}
              </span>
            ))
          )}
        </div>
      )}
    </div>
  );
}
