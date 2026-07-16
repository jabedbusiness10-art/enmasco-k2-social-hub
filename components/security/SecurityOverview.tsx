"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Users, MonitorSmartphone, KeyRound, Ban, Activity, ScrollText, AlertTriangle, DatabaseBackup } from "lucide-react";
import { SecurityStat } from "./SecurityStat";
import { SecurityScore } from "./SecurityScore";
import { SecurityCharts } from "./SecurityCharts";
import { SecCard } from "./primitives";
import { SecuritySkeleton } from "./SecuritySkeleton";

interface Overview { overview: any; score: any; }

export function SecurityOverview() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/security/overview", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

  if (error) return <div className="rounded-2xl border border-rose-400/20 bg-rose-400/5 p-4 text-xs text-rose-300">Failed to load: {error}</div>;
  if (!data) return <SecuritySkeleton />;

  const o = data.overview;
  const chartData = [
    { label: "Users", value: o.protectedUsers, color: "#38bdf8" },
    { label: "Sessions", value: o.activeSessions, color: "#34d399" },
    { label: "Failed", value: o.failedLoginsToday, color: "#fb7185" },
    { label: "API", value: o.apiCallsToday, color: "#a78bfa" },
    { label: "Audit", value: o.auditEventsToday, color: "#fbbf24" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SecurityStat label="Security Score" value={data.score.score} icon={ShieldCheck} tone="blue" hint={data.score.grade} />
        <SecurityStat label="Protected Users" value={o.protectedUsers} icon={Users} tone="green" />
        <SecurityStat label="Active Sessions" value={o.activeSessions} icon={MonitorSmartphone} tone="blue" />
        <SecurityStat label="Failed Logins (24h)" value={o.failedLoginsToday} icon={KeyRound} tone={o.failedLoginsToday > 0 ? "yellow" : "green"} />
        <SecurityStat label="Blocked IPs" value={o.blockedRequests} icon={Ban} tone="gray" />
        <SecurityStat label="API Calls (24h)" value={o.apiCallsToday} icon={Activity} tone="blue" />
        <SecurityStat label="Audit Events (24h)" value={o.auditEventsToday} icon={ScrollText} tone="blue" />
        <SecurityStat label="Critical Alerts" value={o.criticalAlerts} icon={AlertTriangle} tone={o.criticalAlerts > 0 ? "red" : "green"} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SecCard className="lg:col-span-1"><SecurityScore score={data.score.score} grade={data.score.grade} factors={data.score.factors} /></SecCard>
        <SecCard className="p-4 lg:col-span-2">
          <div className="mb-2 text-sm font-medium text-white/80">Activity (24h)</div>
          <SecurityCharts data={chartData} />
        </SecCard>
      </div>

      <SecCard className="flex items-center gap-3 p-4">
        <DatabaseBackup className="h-5 w-5 text-sky-300" />
        <div className="text-xs text-white/60">
          Last backup: {o.lastBackup.available ? new Date(o.lastBackup.at).toLocaleString() : "No backup recorded"}
        </div>
      </SecCard>
    </div>
  );
}
