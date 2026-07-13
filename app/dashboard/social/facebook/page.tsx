"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Users, MessageCircle, FileText, ExternalLink, Loader2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

interface FbData {
  page: { id: string; name: string; fanCount: number | null; followersCount: number | null; category: string | null; link: string | null; about: string | null };
  posts: { id: string; message: string; createdTime: string | null; url: string | null; likes: number; comments: { message: string; from: string | null }[] }[];
  conversations: { id: string; snippet: string; updatedTime: string | null }[];
  fetchedAt: string;
}

export default function FacebookLivePage() {
  const [data, setData] = useState<FbData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/social/facebook/live", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load");
      setData(json);
    } catch (e: any) {
      setError(e.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Facebook Live"
        description="Real-time data from your connected Facebook page (Enma Security Trading Co.) via Meta Graph API."
        actions={
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </button>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>
      )}

      {!data && !error && (
        <div className="flex items-center gap-2 text-white/50"><Loader2 className="h-5 w-5 animate-spin" /> Loading live Facebook data…</div>
      )}

      {data && (
        <>
          {/* Page overview */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-2 text-white/50 text-xs"><Users className="h-4 w-4" /> Followers</div>
              <div className="mt-2 text-3xl font-bold text-white">{data.page.followersCount?.toLocaleString() ?? "—"}</div>
              <div className="text-xs text-white/40">{data.page.name}{data.page.category ? ` · ${data.page.category}` : ""}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-2 text-white/50 text-xs"><Users className="h-4 w-4" /> Page Likes</div>
              <div className="mt-2 text-3xl font-bold text-white">{data.page.fanCount?.toLocaleString() ?? "—"}</div>
              {data.page.link && (
                <a href={data.page.link} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-sky-400 hover:underline">
                  Open page <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-2 text-white/50 text-xs"><MessageCircle className="h-4 w-4" /> Inbox Threads</div>
              <div className="mt-2 text-3xl font-bold text-white">{data.conversations.length}</div>
              <div className="text-xs text-white/40">Recent customer messages</div>
            </div>
          </div>

          {data.page.about && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-white/70">{data.page.about}</div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Posts */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><FileText className="h-4 w-4 text-sky-400" /> Recent Posts</div>
              <div className="space-y-3">
                {data.posts.length === 0 && <div className="text-sm text-white/40">No posts found (or requires pages_read_user_content permission for post content).</div>}
                {data.posts.map((p) => (
                  <div key={p.id} className="rounded-xl border border-white/5 bg-black/20 p-3">
                    <p className="text-sm text-white/80 whitespace-pre-wrap line-clamp-4">{p.message || "(no caption)"}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-white/40">
                      <span>♥ {p.likes}</span>
                      {p.comments.length > 0 && <span>💬 {p.comments.length}</span>}
                      {p.url && <a href={p.url} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">View</a>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><MessageCircle className="h-4 w-4 text-emerald-400" /> Recent Messages</div>
              <div className="space-y-3">
                {data.conversations.length === 0 && <div className="text-sm text-white/40">No conversations.</div>}
                {data.conversations.map((c) => (
                  <div key={c.id} className="rounded-xl border border-white/5 bg-black/20 p-3">
                    <p className="text-sm text-white/80">{c.snippet || "(no preview)"}</p>
                    {c.updatedTime && <div className="mt-1 text-xs text-white/40">{new Date(c.updatedTime).toLocaleString()}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-white/30">Last synced: {new Date(data.fetchedAt).toLocaleString()}</div>
        </>
      )}
    </div>
  );
}
