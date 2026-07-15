"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

const TOGGLES = [
  { key: "desktop", label: "Desktop Notifications" },
  { key: "browser", label: "Browser Notifications" },
  { key: "email", label: "Email Notifications" },
  { key: "sound", label: "Sound" },
  { key: "mentions", label: "Mentions" },
  { key: "assignments", label: "Assignments" },
  { key: "publishing", label: "Publishing" },
  { key: "ai", label: "AI" },
  { key: "security", label: "Security" },
];

const DIGESTS = ["NEVER", "DAILY", "WEEKLY"];

export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/notifications/preferences");
      const j = await r.json();
      setPrefs(j.preferences);
    })();
  }, []);

  const update = async (patch: any) => {
    setPrefs((p: any) => ({ ...p, ...patch }));
    setSaving(true);
    await fetch("/api/notifications/preferences", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    setSaving(false);
    toast.success("Preferences saved");
  };

  if (!prefs) return <div className="h-40 animate-pulse rounded-2xl bg-white/5" />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TOGGLES.map((t) => (
          <label key={t.key} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white/80">
            <span>{t.label}</span>
            <input type="checkbox" checked={!!prefs[t.key]} onChange={(e) => update({ [t.key]: e.target.checked })} className="h-4 w-4 accent-sky-500" />
          </label>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
        <div className="flex items-center gap-2 text-sm text-white/80">Digest Frequency
          <select value={prefs.digest} onChange={(e) => update({ digest: e.target.value })} className="h-9 rounded-xl border border-white/10 bg-white/[0.04] px-2 text-xs text-white">
            {DIGESTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/80">Quiet Hours
          <input type="time" value={prefs.quietFrom || ""} onChange={(e) => update({ quietFrom: e.target.value })} className="h-9 rounded-xl border border-white/10 bg-white/[0.04] px-2 text-xs text-white" />
          <span className="text-white/40">to</span>
          <input type="time" value={prefs.quietTo || ""} onChange={(e) => update({ quietTo: e.target.value })} className="h-9 rounded-xl border border-white/10 bg-white/[0.04] px-2 text-xs text-white" />
        </div>
        {saving && <span className="text-[11px] text-white/40">Saving…</span>}
      </div>
    </div>
  );
}
