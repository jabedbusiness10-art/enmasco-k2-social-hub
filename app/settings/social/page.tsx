"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Plus, RefreshCw, Unplug, Loader2 } from "lucide-react";
import type { CompanySocialAccount, SocialPlatform } from "@/types/company-social";
import { PLATFORM_META, STATUS_META } from "@/types/company-social";
import ConnectDialog from "@/components/company-social/ConnectDialog";

const ROLES_CAN_MANAGE = ["CEO", "ADMIN"];

export default function CompanySocialPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role ?? "VIEWER";
  const canManage = ROLES_CAN_MANAGE.includes(role);

  const [accounts, setAccounts] = useState<CompanySocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectOpen, setConnectOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

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
    setConnectOpen(false);
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

  async function handleDisconnect(id: string) {
    if (!confirm("Disconnect this account?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/social/disconnect/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Disconnect failed");
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Company Social Integration</h1>
          <p className="text-xs text-white/50">
            Manage all official ENMASCO social media connections from one secure location.
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setConnectOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 px-3.5 py-2 text-xs font-semibold text-white"
          >
            <Plus className="h-4 w-4" /> Connect Account
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center text-sm text-white/50">
          No connected accounts yet.{" "}
          {canManage && "Click “Connect Account” to add your first platform."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((acc, i) => {
            const meta = PLATFORM_META[acc.platform];
            const status = STATUS_META[acc.status];
            return (
              <motion.div
                key={acc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold"
                      style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
                    >
                      {meta.label[0]}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-white">{meta.label}</div>
                      <div className="text-xs text-white/60">{acc.accountName}</div>
                    </div>
                  </div>
                  <span
                    className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${status.className}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs text-white/50">
                  <div>Handle: {acc.accountHandle ?? "—"}</div>
                  <div>Account ID: {acc.accountId ?? "—"}</div>
                  <div>Connected by: {acc.connectedBy}</div>
                  <div>Last sync: {acc.lastSyncAt ? new Date(acc.lastSyncAt).toLocaleString() : "—"}</div>
                  {acc.expiresAt && (
                    <div>Expires: {new Date(acc.expiresAt).toLocaleDateString()}</div>
                  )}
                </div>

                {canManage && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleRefresh(acc.id)}
                      disabled={busyId === acc.id}
                      className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white disabled:opacity-40"
                    >
                      {busyId === acc.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />} Refresh
                    </button>
                    <button
                      onClick={() => handleDisconnect(acc.id)}
                      disabled={busyId === acc.id}
                      className="flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/5 px-2 py-1 text-xs text-red-200 disabled:opacity-40"
                    >
                      <Unplug className="h-3 w-3" /> Disconnect
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <ConnectDialog
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
        onConnect={handleConnect}
      />
    </div>
  );
}
