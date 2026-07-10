"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, BarChart3, Sparkles, TrendingUp, Clock, AlertTriangle, Lightbulb } from "lucide-react";

export default function AnalyticsPanel() {
  const [brief, setBrief] = useState("ENMASCO posts about CCTV, smart surveillance, and corporate security across Facebook, Instagram, LinkedIn, X and YouTube in Saudi Arabia.");
  const [report, setReport] = useState("");
  const [busy, setBusy] = useState(false);

  async function analyze() {
    if (busy) return;
    setBusy(true);
    setReport("");
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Analyze this social media context and provide:
1. Best posting times (per platform)
2. Engagement trend insights
3. Weak post types to avoid
4. Best performing content angles
5. Growth suggestions

Context: ${brief}`,
          systemPrompt: "You are K2Kai analytics engine for ENMASCO K2 SOCIAL. Be concise, structured, and actionable.",
        }),
      });
      const json = await res.json();
      setReport(json.result ?? json.error ?? "No result");
    } catch (e: any) {
      setReport("⚠️ " + (e.message ?? "Failed"));
    } finally {
      setBusy(false);
    }
  }

  const tiles = [
    { icon: <Clock className="h-4 w-4" />, label: "Best Posting Time" },
    { icon: <TrendingUp className="h-4 w-4" />, label: "Engagement Trends" },
    { icon: <AlertTriangle className="h-4 w-4" />, label: "Weak Posts" },
    { icon: <Lightbulb className="h-4 w-4" />, label: "Growth Suggestions" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-white/50">AI Analytics</div>
        <div className="grid grid-cols-2 gap-2">
          {tiles.map((t) => (
            <div key={t.label} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-[11px] text-white/70">
              <span className="text-sky-300">{t.icon}</span> {t.label}
            </div>
          ))}
        </div>
        <label className="mb-1 block text-xs text-white/60">Account / Campaign Context</label>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={5}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-white/40"
        />
        <button
          onClick={analyze}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />} Analyze with K2Kai
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50">
          <Sparkles className="h-4 w-4 text-sky-400" /> K2Kai Insights
        </div>
        {busy ? (
          <div className="flex h-40 items-center justify-center text-white/40"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : report ? (
          <motion.pre initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-sm text-white/85">{report}</motion.pre>
        ) : (
          <div className="flex h-40 items-center justify-center text-xs text-white/40">Provide context and run an AI analysis.</div>
        )}
      </div>
    </div>
  );
}
