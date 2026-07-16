"use client";

import { useEffect, useState } from "react";
import { Plus, Play, Pause, Clock } from "lucide-react";
import { StatusBadge } from "./primitives";

interface SchedRow { id: string; name: string; type: string; frequency: string; cron?: string | null; enabled: boolean; paused: boolean; retentionCount: number; nextRunAt?: string | null; }

export function BackupScheduler() {
  const [rows, setRows] = useState<SchedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", type: "DATABASE", frequency: "DAILY", cron: "", retentionCount: 7 });

  useEffect(() => { load(); }, []);
  const load = () => { setLoading(true); fetch("/api/backup/schedule", { cache: "no-store" }).then((r) => r.json()).then((j) => setRows(j.rows ?? [])).finally(() => setLoading(false)); };

  const create = async () => {
    await fetch("/api/backup/schedule", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ name: "", type: "DATABASE", frequency: "DAILY", cron: "", retentionCount: 7 });
    load();
  };
  const toggle = async (id: string, patch: any) => {
    await fetch(`/api/backup/schedule?id=${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-6">
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white placeholder:text-white/30" />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white">
          {["DATABASE", "MEDIA", "USER", "ANALYTICS", "QUEUE", "NOTIFICATION", "CONFIG", "SETTINGS"].map((t) => <option key={t}>{t}</option>)}
        </select>
        <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white">
          {["HOURLY", "DAILY", "WEEKLY", "MONTHLY", "CUSTOM"].map((f) => <option key={f}>{f}</option>)}
        </select>
        <input placeholder="cron (custom)" value={form.cron} onChange={(e) => setForm({ ...form, cron: e.target.value })} className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white placeholder:text-white/30" />
        <input type="number" placeholder="keep" value={form.retentionCount} onChange={(e) => setForm({ ...form, retentionCount: Number(e.target.value) })} className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white" />
        <button onClick={create} className="flex items-center justify-center gap-1 rounded-lg bg-sky-500/80 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-500"><Plus className="h-4 w-4" /> Add</button>
      </div>
      {loading ? <div className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" /> : (
        <div className="space-y-2">
          {rows.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
              <div>
                <div className="font-medium text-white/80">{s.name}</div>
                <div className="text-xs text-white/40">{s.type} · {s.frequency}{s.cron ? ` (${s.cron})` : ""} · keep {s.retentionCount}</div>
                {s.nextRunAt && <div className="mt-0.5 flex items-center gap-1 text-[11px] text-white/30"><Clock className="h-3 w-3" /> next {new Date(s.nextRunAt).toLocaleString()}</div>}
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge tone={s.enabled && !s.paused ? "green" : "gray"}>{s.enabled ? (s.paused ? "PAUSED" : "ACTIVE") : "DISABLED"}</StatusBadge>
                <button onClick={() => toggle(s.id, { enabled: !s.enabled, paused: false })} className="rounded-lg border border-white/10 p-1.5 text-white/60 hover:bg-white/5" title={s.enabled ? "Disable" : "Enable"}>{s.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
