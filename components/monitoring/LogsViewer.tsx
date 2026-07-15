"use client";

import { useMemo, useState } from "react";
import { Search, Filter } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

interface LogRow {
  id: string;
  type: string;
  module: string;
  title: string;
  detail?: string;
  at: number;
  source: string;
}

const CATEGORIES = ["all", "application", "auth", "queue", "publishing", "ai", "media", "security", "api", "system"];
const SEVERITIES = ["all", "info", "warn", "error"] as const;

export default function LogsViewer() {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [sev, setSev] = useState<(typeof SEVERITIES)[number]>("all");
  const [page, setPage] = useState(0);

  // Re-fetch real activity (server logs also stream here) every 15s.
  const load = async () => {
    try {
      const r = await fetch("/api/activity", { cache: "no-store" });
      const j = await r.json();
      setRows(j.items ?? []);
    } finally {
      setLoading(false);
    }
  };
  // initial + interval handled by parent polling; expose load via effect in page.
  // For simplicity we poll here too.
  useMemo(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = rows.filter((r) => {
    if (cat !== "all" && r.source !== cat && r.module !== cat) return false;
    if (sev !== "all" && !r.type.includes(sev) && !(sev === "error" && r.title.toLowerCase().includes("fail"))) return false;
    if (q && !(`${r.title} ${r.detail ?? ""} ${r.module}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const PAGE = 15;
  const paged = filtered.slice(page * PAGE, page * PAGE + PAGE);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <Search className="h-4 w-4 text-white/40" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(0); }}
            placeholder="Search logs…"
            className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/30"
          />
        </div>
        <select value={cat} onChange={(e) => { setCat(e.target.value); setPage(0); }} className="rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-xs text-white">
          {CATEGORIES.map((c) => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
        </select>
        <select value={sev} onChange={(e) => { setSev(e.target.value as any); setPage(0); }} className="rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-xs text-white">
          {SEVERITIES.map((s) => <option key={s} value={s} className="bg-zinc-900">{s}</option>)}
        </select>
      </div>

      {loading && rows.length === 0 ? (
        <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
      ) : filtered.length === 0 ? (
        <EmptyState title="No logs match" description="Adjust filters or wait for new events." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.04]">
          <table className="w-full text-xs">
            <thead className="text-left text-[11px] uppercase text-white/40">
              <tr className="border-b border-white/10">
                <th className="px-3 py-2">Time</th><th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Event</th><th className="px-3 py-2">Detail</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((r) => (
                <tr key={r.id} className="border-b border-white/5 last:border-0">
                  <td className="px-3 py-2 text-white/45">{new Date(r.at).toLocaleString()}</td>
                  <td className="px-3 py-2 text-sky-300">{r.source}</td>
                  <td className="px-3 py-2 font-medium text-white">{r.title}</td>
                  <td className="px-3 py-2 text-white/50">{r.detail ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-white/40">
        <span>{filtered.length} entries</span>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="rounded-lg border border-white/10 px-2 py-1 disabled:opacity-30">Prev</button>
          <button onClick={() => setPage((p) => p + 1)} disabled={paged.length < PAGE} className="rounded-lg border border-white/10 px-2 py-1 disabled:opacity-30">Next</button>
        </div>
      </div>
    </div>
  );
}
