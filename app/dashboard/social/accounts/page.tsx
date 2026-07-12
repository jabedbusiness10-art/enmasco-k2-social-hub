"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Plus, RefreshCw, Search, Loader2 } from "lucide-react";
import type { CompanySocialAccount, SocialPlatform } from "@/types/company-social";
import SocialStatCards from "@/components/company-social/SocialStatCards";
import SocialAccountCard from "@/components/company-social/SocialAccountCard";
import AccountDetailModal from "@/components/company-social/AccountDetailModal";
import ConnectModal from "@/components/company-social/ConnectModal";
import HealthPanel from "@/components/company-social/HealthPanel";
import ActivityTimeline from "@/components/company-social/ActivityTimeline";

const ROLES_CAN_MANAGE = ["CEO", "ADMIN"];

type Filter = "ALL" | "CONNECTED" | "EXPIRING_SOON" | "DISCONNECTED";
type Sort = "newest" | "oldest" | "platform";

export default function CompanySocialPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role ?? "VIEWER";
  const canManage = ROLES_CAN_MANAGE.includes(role);

  const [accounts, setAccounts] = useState<CompanySocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectOpen, setConnectOpen] = useState(false);
  const [reconnectTarget, setReconnectTarget] = useState<CompanySocialAccount | null>(null);
  const [detail, setDetail] = useState<CompanySocialAccount | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refreshingAll, setRefreshingAll] = useState(false);

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
    </div>
  );
}
