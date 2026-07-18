"use client";

import { useEffect, useState } from "react";
import { LogIn, ShieldAlert, ListChecks, KeyRound, Plug, MonitorSmartphone, Radio } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { SecCard } from "@/components/security/primitives";

type Login = { id: string; email: string; result: string; createdAt: string; ip?: string | null; browser?: string | null; country?: string | null };
type Action = { id: string; action: string; actionType?: string | null; createdAt: string; createdBy?: { name?: string; email?: string } | null; status?: string | null };
type Password = { id: string; action: string; createdAt: string; createdBy?: { name?: string; email?: string } | null };
type Api = { id: string; name: string; provider: string; status: string; lastUsedAt?: string | null; user?: { name?: string } | null };
type Device = { id: string; name?: string | null; browser?: string | null; os?: string | null; ip?: string | null; lastUsedAt: string; user?: { name?: string; email?: string } | null };
type Presence = { userId: string; status: string; lastSeen: string; user?: { name?: string; email?: string; status?: string } | null };
type SecEvent = { id: string; title: string; severity: string; type: string; createdAt: string; userEmail?: string | null };

const fmt = (d: string) => new Date(d).toLocaleString();
const toneFor = (s: string) => (s === "SUCCESS" || s === "LOW" ? "emerald" : s === "FAILURE" || s === "CRITICAL" || s === "HIGH" ? "rose" : s === "MEDIUM" ? "amber" : "sky");
const tones: Record<string, string> = {
  emerald: "text-emerald-300 bg-emerald-500/10 border-emerald-400/30",
  rose: "text-rose-300 bg-rose-500/10 border-rose-400/30",
  amber: "text-amber-300 bg-amber-500/10 border-amber-400/30",
  sky: "text-sky-300 bg-sky-500/10 border-sky-400/30",
};

function Box({ icon, title, count, children }: { icon: React.ReactNode; title: string; count: number; children: React.ReactNode }) {
  return (
    <SecCard className="p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/60">
        <span className="text-sky-300">{icon}</span> {title}
        <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">{count}</span>
      </div>
      {children}
    </SecCard>
  );
}
function Sk() { return <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="h-9 animate-pulse rounded-xl bg-white/5" />)}</div>; }
function Empty() { return <p className="py-5 text-center text-sm text-white/40">No records found.</p>; }
function T({ children, tone = "sky" }: { children: React.ReactNode; tone?: "emerald" | "rose" | "amber" | "sky" }) {
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${tones[tone]}`}>{children}</span>;
}

export default function UserActivityPage() {
  const [loading, setLoading] = useState(true);
  const [logins, setLogins] = useState<Login[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [api, setApi] = useState<Api[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [presence, setPresence] = useState<Presence[]>([]);
  const [events, setEvents] = useState<SecEvent[]>([]);

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/users/activity", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        setLogins(j.logins ?? []);
        setActions(j.actions ?? []);
        setPasswords(j.passwordChanges ?? []);
        setApi(j.apiUsage ?? []);
        setDevices(j.devices ?? []);
        setPresence(j.presence ?? []);
        setEvents(j.securityEvents ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="User Activity" description="Per-user behavioural and security activity: logins, actions, password changes, API usage, devices, last seen, and security events." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Box icon={<LogIn className="h-4 w-4" />} title="Login History" count={logins.length}>
          {loading ? <Sk /> : logins.length === 0 ? <Empty /> : (
            <div className="space-y-2">
              {logins.slice(0, 10).map((l) => (
                <div key={l.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs">
                  <T tone={toneFor(l.result) as any}>{l.result}</T>
                  <span className="text-white/80">{l.email}</span>
                  <span className="ml-auto text-white/35">{l.ip ?? "—"} · {fmt(l.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </Box>

        <Box icon={<ListChecks className="h-4 w-4" />} title="User Actions" count={actions.length}>
          {loading ? <Sk /> : actions.length === 0 ? <Empty /> : (
            <div className="space-y-2">
              {actions.slice(0, 10).map((a) => (
                <div key={a.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs">
                  <span className="text-white/85">{a.action}</span>
                  <span className="text-white/40">— {a.createdBy?.name ?? a.createdBy?.email ?? "system"}</span>
                  <span className="ml-auto text-white/35">{fmt(a.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </Box>

        <Box icon={<KeyRound className="h-4 w-4" />} title="Password Changes" count={passwords.length}>
          {loading ? <Sk /> : passwords.length === 0 ? <Empty /> : (
            <div className="space-y-2">
              {passwords.slice(0, 10).map((p) => (
                <div key={p.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs">
                  <span className="text-white/85">{p.action}</span>
                  <span className="text-white/40">— {p.createdBy?.name ?? p.createdBy?.email ?? "system"}</span>
                  <span className="ml-auto text-white/35">{fmt(p.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </Box>

        <Box icon={<Plug className="h-4 w-4" />} title="API Usage" count={api.length}>
          {loading ? <Sk /> : api.length === 0 ? <Empty /> : (
            <div className="space-y-2">
              {api.slice(0, 10).map((a) => (
                <div key={a.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs">
                  <span className="text-white/85">{a.name}</span>
                  <span className="text-white/45">{a.provider}</span>
                  <T tone={toneFor(a.status) as any}>{a.status}</T>
                  <span className="ml-auto text-white/35">{a.lastUsedAt ? fmt(a.lastUsedAt) : "never"}</span>
                </div>
              ))}
            </div>
          )}
        </Box>

        <Box icon={<MonitorSmartphone className="h-4 w-4" />} title="Device History" count={devices.length}>
          {loading ? <Sk /> : devices.length === 0 ? <Empty /> : (
            <div className="space-y-2">
              {devices.slice(0, 10).map((d) => (
                <div key={d.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs">
                  <span className="text-white/85">{d.name ?? `${d.browser ?? "?"} · ${d.os ?? "?"}`}</span>
                  <span className="ml-auto text-white/35">{d.ip ?? "—"} · {fmt(d.lastUsedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </Box>

        <Box icon={<Radio className="h-4 w-4" />} title="Last Seen" count={presence.length}>
          {loading ? <Sk /> : presence.length === 0 ? <Empty /> : (
            <div className="space-y-2">
              {presence.slice(0, 10).map((p) => (
                <div key={p.userId} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs">
                  <span className="text-white/85">{p.user?.name ?? p.userId}</span>
                  <T tone={toneFor(p.user?.status ?? p.status) as any}>{p.user?.status ?? p.status}</T>
                  <span className="ml-auto text-white/35">{fmt(p.lastSeen)}</span>
                </div>
              ))}
            </div>
          )}
        </Box>
      </div>

      <Box icon={<ShieldAlert className="h-4 w-4" />} title="Security Events" count={events.length}>
        {loading ? <Sk /> : events.length === 0 ? <Empty /> : (
          <div className="space-y-2">
            {events.slice(0, 12).map((e) => (
              <div key={e.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs">
                <T tone={toneFor(e.severity) as any}>{e.severity}</T>
                <span className="text-white/85">{e.title}</span>
                <span className="text-white/40">— {e.type}</span>
                <span className="ml-auto text-white/35">{e.userEmail ?? "—"} · {fmt(e.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </Box>
    </div>
  );
}
