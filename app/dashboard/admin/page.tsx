"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import { BackupCard } from "@/components/backup/primitives";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  Users, Activity, ShieldAlert, Plug, Database, HardDrive, HeartPulse,
  CloudUpload, KeyRound, Bell, Cpu, AlertTriangle, CheckCircle2, XCircle, MinusCircle,
  FileText, Clock, ArrowRight, Settings, LayoutGrid, Lock, ShieldCheck, Save, Globe,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* TASK-65.5 — SAFE UI optimization of the Administration landing page. */
/* Reads ONLY existing APIs (security/overview, backup/overview, status, */
/* security/audit, login-history, events). No new endpoints, no schema  */
/* change, no routing change, no renamed components.                    */
/* ------------------------------------------------------------------ */

interface SecOverview { protectedUsers: number; activeSessions: number; failedLoginsToday: number; criticalAlerts: number; lastBackup: { available: boolean; at: string | null }; apiCallsToday: number; }
interface Score { score: number; grade: string; factors: { label: string; detail: string; impact: number }[]; }
interface BackupOverview { totalBackups: number; completedBackups: number; failedBackups: number; verifiedBackups: number; lastSuccessful: string | null; nextScheduled: string | null; recoveryReadiness: number; }
interface ServiceCheck { key: string; label: string; status: string; detail: string; }
interface StatusResp { snapshot: { services: ServiceCheck[]; counts: any; version: string }; externals: { key: string; label: string; configured: boolean; connected: boolean }[]; }
interface AuditRow { id: string; actionType: string; module: string; createdAt: string; severity: string; createdBy?: { name?: string; email?: string } | null; }
interface LoginRow { id: string; result: string; createdAt: string; user?: { name?: string; email?: string } | null; ip?: string; }
interface EventRow { id: string; type: string; severity: string; createdAt: string; message?: string; }

const SVC_LABEL: Record<string, string> = {
  database: "Database", redis: "Redis", bullmq: "Queue Engine", storage: "Storage",
  "next": "App Server", websocket: "Realtime", scheduler: "Scheduler",
};
const EXT_LABEL: Record<string, string> = {
  meta: "Meta API", instagram: "Instagram API", linkedin: "LinkedIn API",
  google_oauth: "Google API", openai: "AI Engine", smtp: "Email Service",
};

export default function AdminOverviewPage() {
  const { t } = useLocale();
  const [sec, setSec] = useState<{ overview: SecOverview; score: Score } | null>(null);
  const [bk, setBk] = useState<{ overview: BackupOverview } | null>(null);
  const [status, setStatus] = useState<StatusResp | null>(null);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [logins, setLogins] = useState<LoginRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [roles, setRoles] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([
      fetch("/api/security/overview", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/backup/overview", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/status", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/security/audit?take=6", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/security/login-history?take=5", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/security/events?take=5", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/security/permissions", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
    ]).then(([s, b, st, a, l, e, p]) => {
      if (!alive) return;
      setSec(s); setBk(b); setStatus(st);
      setAudit(a.rows ?? []); setLogins(l.rows ?? []); setEvents(e.rows ?? []);
      if (p && p.matrix) setRoles(Object.keys(p.matrix).length);
      setLoading(false);
    }).catch(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const services = status?.snapshot.services ?? [];
  const roleCount = sec?.overview ? 5 : 0; // Role model is fixed (see security/permissions)
  const connectedApis = (status?.externals ?? []).filter((x) => x.configured && x.connected).length;
  const totalApis = (status?.externals ?? []).length;
  const storage = status?.snapshot.counts?.storageBytes ?? 0;
  const kpis = [
    { label: "Active Users", value: sec?.overview.protectedUsers ?? "—", icon: Users, tone: "text-sky-300" },
    { label: "Online Sessions", value: sec?.overview.activeSessions ?? "—", icon: Activity, tone: "text-emerald-300" },
    { label: "Active Roles", value: roles ?? "—", icon: ShieldCheck, tone: "text-violet-300" },
    { label: "Connected APIs", value: `${connectedApis}/${totalApis}`, icon: Plug, tone: "text-amber-300" },
    { label: "Security Alerts", value: sec?.overview.criticalAlerts ?? "—", icon: ShieldAlert, tone: "text-rose-300" },
    { label: "Latest Backup", value: sec?.overview.lastBackup.available ? "Done" : "None", icon: CloudUpload, tone: "text-sky-300" },
    { label: "System Health", value: services.some((s) => s.status === "error") ? "Degraded" : "Healthy", icon: HeartPulse, tone: services.some((s) => s.status === "error") ? "text-rose-300" : "text-emerald-300" },
    { label: "Storage Usage", value: `${(storage / 1024 / 1024).toFixed(1)} MB`, icon: HardDrive, tone: "text-sky-300" },
  ];

  const quickActions = [
    { label: "Company Settings", href: "/dashboard/admin/company", icon: Settings },
    { label: "Workspace", href: "/dashboard/admin/company", icon: LayoutGrid },
    { label: "Permissions", href: "/dashboard/admin/security/permissions", icon: Lock },
    { label: "Security Center", href: "/dashboard/admin/security/overview", icon: ShieldCheck },
    { label: "Backup Center", href: "/dashboard/admin/backup", icon: CloudUpload },
    { label: "API Connections", href: "/dashboard/admin/api", icon: Plug },
    { label: "Localization", href: "/dashboard/admin/localization", icon: Globe },
    { label: "System Health", href: "/monitoring", icon: HeartPulse },
  ];

  return (
    <div>
      <PageHeader title="Administration Overview" description="Executive snapshot of users, security, system health and backups — all data from live platform services." />

      {loading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {/* SECTION 1 — KPI cards */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {kpis.map((k) => (
              <BackupCard key={k.label} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">{k.label}</span>
                  <k.icon className={`h-4 w-4 ${k.tone}`} />
                </div>
                <div className={`mt-2 text-2xl font-semibold ${k.tone}`}>{k.value}</div>
              </BackupCard>
            ))}
          </div>

          {/* SECTION 2 + 3 — Security + System status */}
          <div className="grid gap-4 lg:grid-cols-2">
            <BackupCard className="p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white/80"><ShieldAlert className="h-4 w-4 text-rose-300" /> Security Overview</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <SecRow label="Failed Logins Today" value={String(sec?.overview.failedLoginsToday ?? "—")} />
                <SecRow label="API Calls Today" value={String(sec?.overview.apiCallsToday ?? "—")} />
                <SecRow label="2FA Policy" value={sec?.score.factors.some((f) => f.label === "Password Policy" && f.impact >= -4) ? "On" : "Off"} />
                <SecRow label="Permission Changes" value={String(sec?.score.factors.find((f) => f.label === "Permission Hygiene")?.detail ?? "—")} />
              </div>
              <div className="mt-3 space-y-2">
                <SubHeader icon={Activity} title="Recent Login Activity" />
                {logins.length === 0 ? <Empty /> : logins.map((l) => (
                  <div key={l.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-1.5 text-xs">
                    <span className="text-white/60">{l.user?.name ?? l.user?.email ?? "Unknown"}</span>
                    <span className={l.result === "SUCCESS" ? "text-emerald-300" : "text-rose-300"}>{l.result}</span>
                  </div>
                ))}
                <SubHeader icon={AlertTriangle} title="Recent Security Events" />
                {events.length === 0 ? <Empty /> : events.map((e) => (
                  <div key={e.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-1.5 text-xs">
                    <span className="truncate text-white/60">{e.message ?? e.type}</span>
                    <StatusDot status={e.severity === "CRITICAL" ? "error" : e.severity === "WARNING" ? "warning" : "ok"} />
                  </div>
                ))}
              </div>
            </BackupCard>

            <BackupCard className="p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white/80"><HeartPulse className="h-4 w-4 text-emerald-300" /> System Status</h3>
              <div className="space-y-1.5">
                {services.map((s) => (
                  <ServiceRow key={s.key} label={SVC_LABEL[s.key] ?? s.label} status={s.status} />
                ))}
                {(status?.externals ?? []).map((x) => (
                  <ServiceRow key={x.key} label={EXT_LABEL[x.key] ?? x.label} status={x.configured ? (x.connected ? "ok" : "warning") : "disabled"} />
                ))}
              </div>
            </BackupCard>
          </div>

          {/* SECTION 4 — Recent Audit Logs */}
          <BackupCard className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-medium text-white/80"><FileText className="h-4 w-4 text-sky-300" /> Recent Audit Logs</h3>
              <Link href="/dashboard/admin/security/audit" className="text-xs text-sky-300 hover:underline">View all</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-white/40"><tr className="border-b border-white/10"><th className="py-1.5">User</th><th>Action</th><th>Module</th><th>Time</th><th>Status</th></tr></thead>
                <tbody>
                  {audit.length === 0 ? <tr><td colSpan={5} className="py-3 text-center text-white/40">No audit logs yet</td></tr> : audit.map((a) => (
                    <tr key={a.id} className="border-b border-white/5">
                      <td className="py-1.5 text-white/70">{a.createdBy?.name ?? a.createdBy?.email ?? "System"}</td>
                      <td className="text-white/60">{a.actionType}</td>
                      <td className="text-white/60">{a.module}</td>
                      <td className="text-white/50">{new Date(a.createdAt).toLocaleString()}</td>
                      <td><StatusDot status={a.severity === "CRITICAL" ? "error" : a.severity === "WARNING" ? "warning" : "ok"} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </BackupCard>

          {/* SECTION 5 — Backup Summary */}
          <BackupCard className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-medium text-white/80"><CloudUpload className="h-4 w-4 text-sky-300" /> Backup Summary</h3>
              <Link href="/dashboard/admin/backup" className="text-xs text-sky-300 hover:underline">Open Backup Center</Link>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
              <SecRow label="Latest Backup" value={bk?.overview.lastSuccessful ? new Date(bk.overview.lastSuccessful).toLocaleString() : "None"} />
              <SecRow label="Next Scheduled" value={bk?.overview.nextScheduled ? new Date(bk.overview.nextScheduled).toLocaleString() : "Not set"} />
              <SecRow label="Backup Size" value={`${bk?.overview.completedBackups ?? 0} completed`} />
              <SecRow label="Recovery Status" value={`${(bk?.overview.recoveryReadiness ?? 0).toFixed(0)}% ready`} />
            </div>
          </BackupCard>

          {/* SECTION 6 — Quick Administration Actions */}
          <BackupCard className="p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white/80"><Settings className="h-4 w-4 text-violet-300" /> Quick Administration Actions</h3>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {quickActions.map((q) => (
                <Link key={q.label} href={q.href} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/10">
                  <q.icon className="h-4 w-4 text-sky-300" />
                  <span className="flex-1">{q.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-white/30" />
                </Link>
              ))}
            </div>
          </BackupCard>
        </div>
      )}
    </div>
  );
}

function SecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
      <span className="text-white/50">{label}</span>
      <span className="text-white/80">{value}</span>
    </div>
  );
}

function SubHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-white/70"><Icon className="h-3.5 w-3.5 text-white/40" /> {title}</div>;
}

function Empty() {
  return <div className="rounded-lg bg-white/[0.02] px-3 py-2 text-xs text-white/40">No recent entries</div>;
}

function StatusDot({ status }: { status: "ok" | "warning" | "error" | "disabled" }) {
  const map = { ok: CheckCircle2, warning: AlertTriangle, error: XCircle, disabled: MinusCircle };
  const tone = { ok: "text-emerald-400", warning: "text-amber-400", error: "text-rose-400", disabled: "text-white/30" };
  const Icon = map[status];
  return <Icon className={`h-3.5 w-3.5 ${tone[status]}`} />;
}

function ServiceRow({ label, status }: { label: string; status: string }) {
  const s = (status === "ok" ? "Healthy" : status === "warning" ? "Warning" : status === "error" ? "Offline" : "Disabled") as "Healthy" | "Warning" | "Offline" | "Disabled";
  const tone = { Healthy: "text-emerald-300", Warning: "text-amber-300", Offline: "text-rose-300", Disabled: "text-white/30" }[s];
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-1.5 text-xs">
      <span className="text-white/70">{label}</span>
      <span className={tone}>{s}</span>
    </div>
  );
}
