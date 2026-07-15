"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Plus, RefreshCw, Search, Loader2, Megaphone, Globe, Play } from "lucide-react";
import type { CompanySocialAccount, SocialPlatform } from "@/types/company-social";
import SocialStatCards from "@/components/company-social/SocialStatCards";
import SocialAccountCard from "@/components/company-social/SocialAccountCard";
import AccountDetailModal from "@/components/company-social/AccountDetailModal";
import ConnectModal from "@/components/company-social/ConnectModal";
import HealthPanel from "@/components/company-social/HealthPanel";
import ActivityTimeline from "@/components/company-social/ActivityTimeline";
import WebsiteCard, { WebsiteConnectionPublic } from "@/components/company-social/WebsiteCard";
import WebsiteConnectModal from "@/components/company-social/WebsiteConnectModal";
import WebsiteDetailModal from "@/components/company-social/WebsiteDetailModal";

const ROLES_CAN_MANAGE = ["CEO", "ADMIN"];

// TASK-57 — lightweight YouTube glyph (lucide-react has no YouTube brand icon).
function YoutubeGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
    </svg>
  );
}

type Filter = "ALL" | "CONNECTED" | "EXPIRING_SOON" | "DISCONNECTED";
type Sort = "newest" | "oldest" | "platform";

export default function CompanySocialPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const role = (session?.user as { role?: string } | undefined)?.role ?? "VIEWER";
  const canManage = ROLES_CAN_MANAGE.includes(role);
  const [metaStatus, setMetaStatus] = useState<{ kind: "success" | "error"; msg: string } | null>(null);
  const [linkedinStatus, setLinkedinStatus] = useState<{ kind: "success" | "error"; msg: string } | null>(null);
  const [youtubeStatus, setYoutubeStatus] = useState<{ kind: "success" | "error"; msg: string } | null>(null);

  const [accounts, setAccounts] = useState<CompanySocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectOpen, setConnectOpen] = useState(false);
  const [reconnectTarget, setReconnectTarget] = useState<CompanySocialAccount | null>(null);
  const [detail, setDetail] = useState<CompanySocialAccount | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refreshingAll, setRefreshingAll] = useState(false);

  const [websites, setWebsites] = useState<WebsiteConnectionPublic[]>([]);
  const [websiteBusyId, setWebsiteBusyId] = useState<string | null>(null);
  const [websiteConnectOpen, setWebsiteConnectOpen] = useState(false);
  const [websiteDetail, setWebsiteDetail] = useState<WebsiteConnectionPublic | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [sort, setSort] = useState<Sort>("newest");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/social/accounts", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load");
      setAccounts(json.accounts ?? []);
      setError(null);
    } catch (e: any) {
      setError(e.message ?? "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // TASK-45 — surface Meta OAuth result from callback redirect query.
  useEffect(() => {
    const meta = searchParams.get("meta");
    if (!meta) return;
    if (meta === "success") setMetaStatus({ kind: "success", msg: "Meta connection established successfully." });
    else if (meta === "error") {
      const reason = searchParams.get("reason") ?? "Connection failed";
      setMetaStatus({ kind: "error", msg: reason });
    } else if (meta === "unauthorized") {
      setMetaStatus({ kind: "error", msg: "You are not authorized to connect Meta." });
    }
    // clear the query param so a refresh doesn't re-trigger
    window.history.replaceState({}, "", "/dashboard/social/accounts");
  }, [searchParams]);

  // TASK-46 — surface LinkedIn OAuth result from callback redirect query.
  useEffect(() => {
    const li = searchParams.get("linkedin");
    if (!li) return;
    if (li === "success") setLinkedinStatus({ kind: "success", msg: "LinkedIn Company Page connected successfully." });
    else if (li === "error") {
      const reason = searchParams.get("reason") ?? "Connection failed";
      setLinkedinStatus({ kind: "error", msg: reason });
    } else if (li === "unauthorized") {
      setLinkedinStatus({ kind: "error", msg: "You are not authorized to connect LinkedIn." });
    }
    window.history.replaceState({}, "", "/dashboard/social/accounts");
  }, [searchParams]);

  // TASK-57 — surface YouTube (Google) OAuth result from callback redirect query.
  useEffect(() => {
    const yt = searchParams.get("youtube");
    if (!yt) return;
    if (yt === "success") setYoutubeStatus({ kind: "success", msg: "YouTube channel connected successfully." });
    else if (yt === "error") {
      const reason = searchParams.get("reason") ?? "Connection failed";
      setYoutubeStatus({ kind: "error", msg: reason });
    } else if (yt === "unauthorized") {
      setYoutubeStatus({ kind: "error", msg: "You are not authorized to connect YouTube." });
    }
    window.history.replaceState({}, "", "/dashboard/social/accounts");
  }, [searchParams]);

  function connectWithMeta() {
    window.location.href = "/api/social/meta/auth";
  }

  function connectWithLinkedIn() {
    window.location.href = "/api/social/linkedin/connect";
  }

  function connectWithYouTube() {
    window.location.href = "/api/social/youtube/auth";
  }

  async function handleConnect(payload: any) {
    const res = await fetch("/api/social/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Connection failed");
    await load();
  }

  async function handleRefresh(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/social/refresh/${id}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Refresh failed");
      setAccounts((p) => p.map((a) => (a.id === id ? json.account : a)));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleRefreshAll() {
    setRefreshingAll(true);
    try {
      await Promise.all(
        accounts.filter((a) => a.status !== "DISCONNECTED").map((a) => handleRefreshSilent(a.id)),
      );
      await load();
    } finally {
      setRefreshingAll(false);
    }
  }

  async function handleRefreshSilent(id: string) {
    const res = await fetch(`/api/social/refresh/${id}`, { method: "POST" });
    if (res.ok) {
      const json = await res.json();
      setAccounts((p) => p.map((a) => (a.id === id ? json.account : a)));
    }
  }

  async function handleDisconnect(acc: CompanySocialAccount) {
    if (!confirm(`Disconnect ${acc.accountName}?`)) return;
    setBusyId(acc.id);
    try {
      const res = await fetch(`/api/social/disconnect/${acc.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Disconnect failed");
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  // --- TASK-47 — Website connections ---
  const loadWebsites = useCallback(async () => {
    try {
      const res = await fetch("/api/website/connect", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load websites");
      setWebsites(json.connections ?? []);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    loadWebsites();
  }, [loadWebsites]);

  async function handleWebsiteConnect(payload: any) {
    const res = await fetch("/api/website/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Website connection failed");
    await loadWebsites();
  }

  async function handleWebsiteTest(id: string) {
    setWebsiteBusyId(id);
    try {
      const res = await fetch(`/api/website/status/${id}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Test failed");
      await loadWebsites();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setWebsiteBusyId(null);
    }
  }

  async function handleWebsiteSync(id: string) {
    setWebsiteBusyId(id);
    try {
      const res = await fetch(`/api/website/sync/${id}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Sync failed");
      await loadWebsites();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setWebsiteBusyId(null);
    }
  }

  async function handleWebsiteDisconnect(conn: WebsiteConnectionPublic) {
    if (!confirm(`Disconnect ${conn.websiteName}?`)) return;
    setWebsiteBusyId(conn.id);
    try {
      const res = await fetch(`/api/website/disconnect/${conn.id}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Disconnect failed");
      await loadWebsites();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setWebsiteBusyId(null);
    }
  }

  async function handleWebsiteReconnect(conn: WebsiteConnectionPublic) {
    setWebsiteBusyId(conn.id);
    try {
      // Re-test re-establishes the connection health.
      const res = await fetch(`/api/website/status/${conn.id}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Reconnect failed");
      await loadWebsites();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setWebsiteBusyId(null);
    }
  }

  const stats = useMemo(() => {
    const connected = accounts.filter((a) => a.status !== "DISCONNECTED").length;
    const healthy = accounts.filter((a) => a.status === "CONNECTED").length;
    const expiring = accounts.filter((a) => a.status === "EXPIRING_SOON").length;
    const disconnected = accounts.filter((a) => a.status === "DISCONNECTED").length;
    const syncs = accounts.map((a) => a.lastSyncAt).filter(Boolean) as string[];
    const lastSync = syncs.length ? syncs.reduce((a, b) => (new Date(a) > new Date(b) ? a : b)) : null;
    return { connected, healthy, expiring, disconnected, lastSync };
  }, [accounts]);

  const filtered = useMemo(() => {
    let list = accounts;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.accountName.toLowerCase().includes(q) ||
          (a.accountHandle ?? "").toLowerCase().includes(q) ||
          (a.username ?? "").toLowerCase().includes(q) ||
          a.platform.toLowerCase().includes(q),
      );
    }
    if (filter !== "ALL") list = list.filter((a) => a.status === filter);
    list = [...list];
    if (sort === "newest") list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sort === "oldest") list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else list.sort((a, b) => a.platform.localeCompare(b.platform));
    return list;
  }, [accounts, search, filter, sort]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-xl"
      >
        <div>
          <h1 className="text-xl font-bold text-white">Company Social Integration</h1>
          <p className="text-xs text-white/50">
            Manage all official ENMASCO social media connections from one secure location.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-white/45 sm:block">
            Last Sync: {stats.lastSync ? new Date(stats.lastSync).toLocaleString() : "—"}
          </span>
          {canManage && (
            <button
              onClick={handleRefreshAll}
              disabled={refreshingAll}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              {refreshingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh All
            </button>
          )}
          {canManage && (
            <button
              onClick={connectWithMeta}
              className="flex items-center gap-1.5 rounded-xl border border-[#1877F2]/40 bg-[#1877F2]/15 px-3.5 py-2 text-xs font-semibold text-[#9fc4ff] transition hover:bg-[#1877F2]/25"
            >
              <Megaphone className="h-4 w-4" /> Connect with Meta
            </button>
          )}
          {canManage && (
            <button
              onClick={connectWithLinkedIn}
              className="flex items-center gap-1.5 rounded-xl border border-[#0A66C2]/40 bg-[#0A66C2]/15 px-3.5 py-2 text-xs font-semibold text-[#9cc0f5] transition hover:bg-[#0A66C2]/25"
            >
              <LinkedinIcon className="h-4 w-4" /> Connect LinkedIn
            </button>
          )}
          {canManage && (
            <button
              onClick={connectWithYouTube}
              className="flex items-center gap-1.5 rounded-xl border border-[#FF0000]/40 bg-[#FF0000]/15 px-3.5 py-2 text-xs font-semibold text-[#ff9b9b] transition hover:bg-[#FF0000]/25"
            >
              <YoutubeGlyph className="h-4 w-4" /> Connect YouTube
            </button>
          )}
          {canManage && (
            <button
              onClick={() => setWebsiteConnectOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-400/15 px-3.5 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/25"
            >
              <Globe className="h-4 w-4" /> Connect Website
            </button>
          )}
          {canManage && (
            <button
              onClick={() => {
                setReconnectTarget(null);
                setConnectOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-sky-500/20"
            >
              <Plus className="h-4 w-4" /> Connect Account
            </button>
          )}
        </div>
      </motion.div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-300">{error}</div>
      )}

      {metaStatus && (
        <div
          className={`rounded-xl border px-4 py-2 text-xs ${
            metaStatus.kind === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          {metaStatus.msg}
        </div>
      )}

      {linkedinStatus && (
        <div
          className={`rounded-xl border px-4 py-2 text-xs ${
            linkedinStatus.kind === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          {linkedinStatus.msg}
        </div>
      )}

      {youtubeStatus && (
        <div
          className={`rounded-xl border px-4 py-2 text-xs ${
            youtubeStatus.kind === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          {youtubeStatus.msg}
        </div>
      )}

      {/* Stat cards */}
      <SocialStatCards
        connected={stats.connected}
        healthy={stats.healthy}
        expiring={stats.expiring}
        disconnected={stats.disconnected}
        lastSync={stats.lastSync}
      />

      {/* Search + filter */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by platform, account name or username..."
            className="h-9 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-white/40 focus:border-sky-400/50"
          />
        </div>
        <div className="flex gap-2">
          {(["ALL", "CONNECTED", "EXPIRING_SOON", "DISCONNECTED"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                filter === f ? "border-sky-400/40 bg-sky-400/10 text-sky-200" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {f === "ALL" ? "All" : f === "CONNECTED" ? "Connected" : f === "EXPIRING_SOON" ? "Expiring" : "Disconnected"}
            </button>
          ))}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-9 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="platform">Platform</option>
          </select>
        </div>
      </div>

      {/* Main grid + health panel */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_300px]">
        <div>
          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 animate-pulse rounded-3xl bg-white/5" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-14 text-center">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl">🔗</div>
              <div className="text-sm font-semibold text-white">No company accounts connected yet.</div>
              <div className="mt-1 text-xs text-white/50">Connect your first official platform to get started.</div>
              {canManage && (
                <button
                  onClick={() => setConnectOpen(true)}
                  className="mt-4 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 px-4 py-2 text-xs font-semibold text-white"
                >
                  <Plus className="h-4 w-4" /> Connect Account
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((acc) => (
                <SocialAccountCard
                  key={acc.id}
                  account={acc}
                  canManage={canManage}
                  busy={busyId === acc.id}
                  onView={setDetail}
                  onRefresh={handleRefresh}
                  onReconnect={(a) => {
                    setReconnectTarget(a);
                    setConnectOpen(true);
                  }}
                  onDisconnect={handleDisconnect}
                />
              ))}
              {websites.map((conn) => (
                <WebsiteCard
                  key={conn.id}
                  conn={conn}
                  canManage={canManage}
                  busy={websiteBusyId === conn.id}
                  onView={setWebsiteDetail}
                  onTest={handleWebsiteTest}
                  onSync={handleWebsiteSync}
                  onReconnect={handleWebsiteReconnect}
                  onDisconnect={handleWebsiteDisconnect}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <HealthPanel />
        </div>
      </div>

      {/* Activity timeline */}
      <ActivityTimeline accounts={accounts} />

      {/* Modals */}
      <ConnectModal
        open={connectOpen}
        onClose={() => {
          setConnectOpen(false);
          setReconnectTarget(null);
        }}
        onConnect={handleConnect}
        initialPlatform={reconnectTarget?.platform ?? null}
      />
      {detail && <AccountDetailModal account={detail} onClose={() => setDetail(null)} />}
      <WebsiteConnectModal
        open={websiteConnectOpen}
        onClose={() => setWebsiteConnectOpen(false)}
        onConnect={handleWebsiteConnect}
      />
      {websiteDetail && (
        <WebsiteDetailModal conn={websiteDetail} onClose={() => setWebsiteDetail(null)} />
      )}
    </div>
  );
}

/** Inline LinkedIn glyph — avoids a hard lucide-react version dependency. */
function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.24 8.25h4.52V24H.24V8.25zM8.34 8.25h4.33v2.15h.06c.6-1.14 2.07-2.34 4.26-2.34 4.56 0 5.4 3 5.4 6.9V24h-4.52v-6.98c0-1.66-.03-3.8-2.32-3.8-2.32 0-2.67 1.81-2.67 3.68V24H8.34V8.25z" />
    </svg>
  );
}
