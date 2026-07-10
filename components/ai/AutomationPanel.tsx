"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Reply, Captions, Hash, Tags, CalendarClock } from "lucide-react";

type AutoKind = "reply" | "caption" | "hashtag" | "categorize" | "schedule";

export default function AutomationPanel() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Partial<Record<AutoKind, string>>>({});
  const [busy, setBusy] = useState<AutoKind | null>(null);

  async function run(kind: AutoKind) {
    if (busy || !input.trim()) return;
    setBusy(kind);
    const prompts: Record<AutoKind, string> = {
      reply: `Draft a professional auto-reply to this incoming message: "${input}". Tone: helpful, on-brand for ENMASCO security. Keep under 2 sentences.`,
      caption: `Auto-generate a social media caption for this context: "${input}". Include hook + body.`,
      hashtag: `Suggest 10 relevant hashtags for: "${input}". Comma-separated.`,
      categorize: `Classify this content into one category (Security Services, CCTV Marketing, Corporate Promotion, Recruitment, Awareness Campaign) and explain briefly: "${input}".`,
      schedule: `Given this content: "${input}", recommend the best day and time to post and why (consider B2B vs B2C, platform norms).`,
    };
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompts[kind], systemPrompt: "You are K2Kai automation assistant for ENMASCO K2 SOCIAL." }),
      });
      const json = await res.json();
      setResults((r) => ({ ...r, [kind]: json.result ?? json.error ?? "No result" }));
    } catch (e: any) {
      setResults((r) => ({ ...r, [kind]: "⚠️ " + (e.message ?? "Failed") }));
    } finally {
      setBusy(null);
    }
  }

  const tools: { id: AutoKind; label: string; icon: React.ReactNode }[] = [
    { id: "reply", label: "Auto Reply Draft", icon: <Reply className="h-4 w-4" /> },
    { id: "caption", label: "Auto Caption", icon: <Captions className="h-4 w-4" /> },
    { id: "hashtag", label: "Auto Hashtags", icon: <Hash className="h-4 w-4" /> },
    { id: "categorize", label: "Auto Categorize", icon: <Tags className="h-4 w-4" /> },
    { id: "schedule", label: "Schedule Recommend", icon: <CalendarClock className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/50">AI Automation</div>
        <p className="mb-3 text-[11px] text-white/45">Let K2Kai draft, categorize and schedule for you.</p>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          placeholder="Paste an incoming message, post draft, or content idea…"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-white/40"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <span className="rounded-lg bg-gradient-to-br from-sky-500/20 to-rose-500/10 p-1.5 text-sky-200">{t.icon}</span>
                {t.label}
              </div>
              <button
                onClick={() => run(t.id)}
                disabled={busy === t.id || !input.trim()}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-medium text-white/85 hover:bg-white/10 disabled:opacity-40"
              >
                {busy === t.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} Run
              </button>
            </div>
            <div className="mt-3 min-h-[56px] rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-xs text-white/80">
              {busy === t.id ? (
                <div className="flex items-center gap-2 text-white/40"><Loader2 className="h-4 w-4 animate-spin" /> Running…</div>
              ) : results[t.id] ? (
                <motion.pre initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-pre-wrap break-words">{results[t.id]}</motion.pre>
              ) : (
                <span className="text-white/35">Add input above and run.</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
