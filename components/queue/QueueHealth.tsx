"use client";

import { Server, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function QueueHealth({ health }: { health: any }) {
  const available = health?.available;
  const configured = health?.configured;
  const connected = health?.redisConnected;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50">
        <Server className="h-4 w-4" /> Redis / Engine Status
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <StatusPill ok={configured} label={configured ? "Redis Configured" : "Redis Not Configured"} />
        <StatusPill ok={connected} label={connected ? "Redis Connected" : "Redis Down"} />
        <StatusPill
          ok={available}
          label={available ? "Engine: BullMQ" : "Engine: DB Fallback"}
        />
      </div>
      {!configured && (
        <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          Queue engine offline. Set <code className="text-amber-200">REDIS_URL</code> in
          <code className="mx-1 text-amber-200">.env.local</code> to enable BullMQ background jobs.
          The app continues using the database-backed queue.
        </p>
      )}
    </div>
  );
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
        ok
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
          : "border-rose-400/30 bg-rose-400/10 text-rose-300"
      }`}
    >
      {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}
