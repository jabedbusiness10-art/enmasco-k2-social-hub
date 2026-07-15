"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe, RefreshCw, AlertTriangle } from "lucide-react";

export default function EnterpriseIntelligence() {
  const [items, setItems] = useState<any[]>([]);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [stale, setStale] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/intelligence");
      const j = await r.json();
      setItems(j.items || []);
      setUpdatedAt(j.updatedAt || null);
      setStale(!!j.stale);
    } catch {
      setStale(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60 * 60 * 1000); // auto refresh 60 min
    return () => clearInterval(t);
  }, []);

  if (loading) return <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />)}</div>;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Globe className="h-4 w-4 text-sky-400" /> Enterprise Intelligence Feed
        </div>
        <div className="flex items-center gap-2 text-[11px] text-white/40">
          {stale && <span className="flex items-center gap-1 text-amber-300"><AlertTriangle className="h-3 w-3" /> cached</span>}
          {updatedAt && <span>Updated {new Date(updatedAt).toLocaleString()}</span>}
          <button onClick={load} className="rounded-lg border border-white/10 p-1 hover:bg-white/5"><RefreshCw className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-12 text-center text-sm text-white/40">
          External sources temporarily unavailable. Showing last cached updates when available.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          {items.map((it, i) => (
            <motion.a key={it.id} href={it.link} target="_blank" rel="noreferrer" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.015 }}
              className="group rounded-xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-sky-400/30 hover:bg-sky-400/[0.05]">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-sky-200">{it.source}</span>
                {it.published && <span className="text-[10px] text-white/40">{new Date(it.published).toLocaleDateString()}</span>}
              </div>
              <div className="mt-1 text-sm font-medium text-white/90 group-hover:text-white">{it.title}</div>
              {it.summary && <div className="mt-0.5 line-clamp-2 text-[11px] text-white/50">{it.summary}</div>}
            </motion.a>
          ))}
        </div>
      )}
    </div>
  );
}
