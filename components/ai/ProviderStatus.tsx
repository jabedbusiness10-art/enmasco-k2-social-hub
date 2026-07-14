"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, Circle } from "lucide-react";

interface ProviderInfo {
  id: string;
  label: string;
  configured: boolean;
  status: "online" | "demo" | "offline";
}

const STATUS_META: Record<string, { label: string; cls: string; Icon: any }> = {
  online: { label: "Online", cls: "bg-emerald-500/15 text-emerald-300", Icon: ShieldCheck },
  demo: { label: "Demo", cls: "bg-amber-500/15 text-amber-300", Icon: Circle },
  offline: { label: "Offline", cls: "bg-white/10 text-white/40", Icon: ShieldAlert },
};

export default function ProviderStatus() {
  const [list, setList] = useState<ProviderInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/settings")
      .then((r) => r.json())
      .then((j) => {
        const active = j?.provider ?? "mock";
        // The manager reports status; we mirror it client-side for display.
        const known: ProviderInfo[] = [
          { id: "openrouter", label: "OpenRouter", configured: true, status: active === "openrouter" ? "online" : "offline" },
          { id: "openai", label: "OpenAI", configured: false, status: active === "openai" ? "online" : "offline" },
          { id: "gemini", label: "Google Gemini", configured: false, status: "offline" },
          { id: "claude", label: "Anthropic Claude", configured: false, status: "offline" },
          { id: "ollama", label: "Local LLM (Ollama)", configured: false, status: "offline" },
        ];
        setList(known);
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <ShieldCheck className="h-4 w-4 text-sky-400" /> Provider Status
      </div>
      {loading ? (
        <div className="h-24 animate-pulse rounded-2xl bg-white/5" />
      ) : (
        <div className="space-y-2">
          {list.map((p) => {
            const m = STATUS_META[p.status];
            const Icon = m.Icon;
            return (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-white/50" />
                  <span className="text-sm text-white/85">{p.label}</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${m.cls}`}>{m.label}</span>
              </div>
            );
          })}
          <p className="mt-2 text-[11px] text-white/40">
            Switch providers via <code className="text-white/60">AI_PROVIDER</code> in
            <code className="text-white/60">.env.local</code> — no app-code change required.
          </p>
        </div>
      )}
    </div>
  );
}
