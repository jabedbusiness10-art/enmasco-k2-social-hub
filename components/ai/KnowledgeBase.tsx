"use client";

import { useEffect, useState } from "react";
import { BookOpen, Search, Send } from "lucide-react";

interface Doc {
  id: string;
  title: string;
  source: string | null;
  category: { name: string };
}
interface Cat {
  id: string;
  name: string;
  _count?: { documents: number };
}

export default function KnowledgeBase() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/ai/knowledge")
      .then((r) => r.json())
      .then((j) => {
        setCats(j.categories ?? []);
        setDocs(j.documents ?? []);
      })
      .catch(() => {});
  }, []);

  const ask = async () => {
    if (!q.trim()) return;
    setLoading(true);
    setAnswer("");
    try {
      const r = await fetch("/api/ai/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const j = await r.json();
      setAnswer(j.answer ?? j.error ?? "No answer.");
    } catch {
      setAnswer("Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
          <BookOpen className="h-4 w-4 text-sky-400" /> Company Knowledge Base
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask()}
              placeholder="Ask ENMASCO knowledge (products, warranty, catalog)..."
              className="h-9 w-full rounded-xl border border-white/10 bg-white/[0.06] pl-8 pr-3 text-xs text-white outline-none focus:border-sky-400"
            />
          </div>
          <button
            onClick={ask}
            disabled={loading}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 px-3 text-xs font-semibold text-white disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" /> Ask
          </button>
        </div>
        {answer && (
          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs leading-relaxed text-white/80 whitespace-pre-wrap">
            {answer}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">Categories</div>
          {cats.length === 0 ? (
            <div className="text-[11px] text-white/35">No categories yet.</div>
          ) : (
            <div className="space-y-2">
              {cats.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <span className="text-sm text-white/85">{c.name}</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/60">
                    {c._count?.documents ?? 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">Documents</div>
          {docs.length === 0 ? (
            <div className="text-[11px] text-white/35">No documents yet. Add ENMASCO knowledge to enable AI answers.</div>
          ) : (
            <div className="space-y-2">
              {docs.map((d) => (
                <div key={d.id} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <div className="text-sm text-white/85">{d.title}</div>
                  <div className="mt-0.5 text-[10px] text-white/40">
                    {d.category?.name}
                    {d.source ? ` · ${d.source}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
