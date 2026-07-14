"use client";

import { useEffect, useState } from "react";
import { FolderPlus, ChevronRight, Star } from "lucide-react";

interface Collection { id: string; name: string; parentId: string | null; isPinned: boolean; _count?: { items: number; children: number }; }

export default function CollectionSidebar({ activeId, onSelect }: { activeId?: string | null; onSelect: (id: string | null) => void }) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/media/collections");
    const j = await r.json();
    setCollections(j.collections ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!newName.trim()) return;
    await fetch("/api/media/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setNewName("");
    load();
  };

  // simple 2-level tree: roots + their children
  const roots = collections.filter((c) => !c.parentId);
  const childrenOf = (id: string) => collections.filter((c) => c.parentId === id);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Star className="h-4 w-4 text-sky-400" /> Collections
        </div>
        <button onClick={() => onSelect(null)} className={`text-[10px] ${!activeId ? "text-sky-300" : "text-white/40"}`}>All</button>
      </div>
      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && create()}
          placeholder="New collection"
          className="h-8 flex-1 rounded-lg border border-white/10 bg-white/[0.06] px-2 text-[11px] text-white outline-none focus:border-sky-400"
        />
        <button onClick={create} className="flex h-8 items-center rounded-lg bg-white/10 px-2 text-white/70"><FolderPlus className="h-3.5 w-3.5" /></button>
      </div>
      {loading ? (
        <div className="mt-3 h-24 animate-pulse rounded-2xl bg-white/5" />
      ) : (
        <div className="mt-2 space-y-0.5">
          {roots.map((c) => (
            <div key={c.id}>
              <button
                onClick={() => onSelect(c.id)}
                className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs ${activeId === c.id ? "bg-sky-500/15 text-white" : "text-white/70 hover:bg-white/5"}`}
              >
                <span className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3 opacity-40" />{c.name}</span>
                <span className="text-[10px] text-white/40">{c._count?.items ?? 0}</span>
              </button>
              {childrenOf(c.id).map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => onSelect(ch.id)}
                  className={`flex w-full items-center justify-between rounded-lg py-1.5 pl-7 pr-2 text-left text-[11px] ${activeId === ch.id ? "bg-sky-500/15 text-white" : "text-white/55 hover:bg-white/5"}`}
                >
                  <span>{ch.name}</span>
                  <span className="text-[9px] text-white/35">{ch._count?.items ?? 0}</span>
                </button>
              ))}
            </div>
          ))}
          {roots.length === 0 && <div className="mt-2 text-[11px] text-white/35">No collections yet.</div>}
        </div>
      )}
    </div>
  );
}
