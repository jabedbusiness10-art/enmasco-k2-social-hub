"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

interface AISettings { model: string; provider: string; temperature: number; maxTokens: number; streaming: boolean; systemPrompt: string; defaultLanguage: string; }

export default function AISettingsForm() {
  const [s, setS] = useState<AISettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/ai/settings").then((r) => r.json()).then((j) => setS(j.settings));
  }, []);

  if (!s) return <div className="flex h-32 items-center justify-center text-white/40"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  function update<K extends keyof AISettings>(k: K, v: AISettings[K]) {
    setS({ ...s!, [k]: v });
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    await fetch("/api/ai/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) });
    setSaving(false);
    setSaved(true);
  }

  const field = "h-9 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-sky-400/50";

  return (
    <div className="max-w-xl space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="text-sm font-semibold text-white">AI Configuration</div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-white/60">Provider</label>
          <select value={s.provider} onChange={(e) => update("provider", e.target.value)} className={field}>
            <option value="mock">K2Kai Demo (Offline)</option>
            <option value="openai">OpenAI</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/60">Model</label>
          <input value={s.model} onChange={(e) => update("model", e.target.value)} className={field} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/60">Temperature ({s.temperature})</label>
          <input type="range" min={0} max={1} step={0.1} value={s.temperature} onChange={(e) => update("temperature", parseFloat(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/60">Max Tokens</label>
          <input type="number" value={s.maxTokens} onChange={(e) => update("maxTokens", parseInt(e.target.value) || 1024)} className={field} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/60">Default Language</label>
          <select value={s.defaultLanguage} onChange={(e) => update("defaultLanguage", e.target.value)} className={field}>
            <option value="en">English</option>
            <option value="bn">Bengali</option>
            <option value="ar">Arabic</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-xs text-white/70">
            <input type="checkbox" checked={s.streaming} onChange={(e) => update("streaming", e.target.checked)} /> Streaming Response
          </label>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-white/60">System Prompt</label>
        <textarea value={s.systemPrompt} onChange={(e) => update("systemPrompt", e.target.value)} rows={3} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none" />
      </div>

      <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Settings
      </button>
      {saved && <span className="ml-2 text-xs text-emerald-300">Saved ✓</span>}
    </div>
  );
}
