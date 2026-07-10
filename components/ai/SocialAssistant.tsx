"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Hash, MessageSquareText, Smile, Wand2 } from "lucide-react";

const PLATFORMS = ["Facebook", "Instagram", "LinkedIn", "X", "YouTube"] as const;
type Platform = (typeof PLATFORMS)[number];

const PLATFORM_COLOR: Record<Platform, string> = {
  Facebook: "#1877F2",
  Instagram: "#E4405F",
  LinkedIn: "#0A66C2",
  X: "#1DA1F2",
  YouTube: "#FF0000",
};

type GenKind = "caption" | "hashtags" | "cta" | "emoji";

export default function SocialAssistant() {
  const [platform, setPlatform] = useState<Platform>("Instagram");
  const [topic, setTopic] = useState("Smart CCTV security system for businesses");
  const [results, setResults] = useState<Partial<Record<GenKind, string>>>({});
  const [busy, setBusy] = useState<GenKind | null>(null);

  async function generate(kind: GenKind) {
    if (busy) return;
    setBusy(kind);
    const prompts: Record<GenKind, string> = {
      caption: `Write a high-performing ${platform} post caption about: ${topic}. Include an engaging hook and a natural brand voice for ENMASCO.`,
      hashtags: `Generate 12 relevant, high-reach hashtags for a ${platform} post about: ${topic}. Return as a comma-separated list.`,
      cta: `Write 3 strong call-to-action (CTA) lines for a ${platform} post about: ${topic}. Short and action-oriented.`,
      emoji: `Suggest 6 emojis that fit a ${platform} post about: ${topic}. Return just the emojis.`,
    };
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompts[kind],
          systemPrompt: `You are K2Kai, ENMASCO K2 SOCIAL's social media copywriter. Platform: ${platform}.`,
        }),
      });
      const json = await res.json();
      setResults((r) => ({ ...r, [kind]: json.result ?? json.error ?? "No result" }));
    } catch (e: any) {
      setResults((r) => ({ ...r, [kind]: "⚠️ " + (e.message ?? "Failed") }));
    } finally {
      setBusy(null);
    }
  }

  const kinds: { id: GenKind; label: string; icon: React.ReactNode; color: string }[] = [
    { id: "caption", label: "Caption", icon: <MessageSquareText className="h-4 w-4" />, color: "from-sky-500/20 to-sky-500/5 text-sky-200" },
    { id: "hashtags", label: "Hashtags", icon: <Hash className="h-4 w-4" />, color: "from-rose-500/20 to-rose-500/5 text-rose-200" },
    { id: "cta", label: "CTA", icon: <Wand2 className="h-4 w-4" />, color: "from-emerald-500/20 to-emerald-500/5 text-emerald-200" },
    { id: "emoji", label: "Emoji", icon: <Smile className="h-4 w-4" />, color: "from-amber-500/20 to-amber-500/5 text-amber-200" },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">AI Social Assistant</div>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                platform === p ? "border-white/20 bg-white/10 text-white" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
              }`}
              style={platform === p ? { boxShadow: `0 0 0 1px ${PLATFORM_COLOR[p]}55` } : undefined}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <label className="mb-1 block text-xs text-white/60">Topic / Product</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="h-9 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none placeholder:text-white/40 focus:border-sky-400/50"
            placeholder="What do you want to post about?"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {kinds.map((k) => (
          <motion.div
            key={k.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 text-sm font-semibold text-white`}>
                <span className={`rounded-lg bg-gradient-to-br ${k.color} p-1.5`}>{k.icon}</span>
                {k.label}
              </div>
              <button
                onClick={() => generate(k.id)}
                disabled={busy === k.id}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/85 hover:bg-white/10 disabled:opacity-50"
              >
                {busy === k.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} Generate
              </button>
            </div>
            <div className="mt-3 min-h-[64px] rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-white/80">
              {busy === k.id ? (
                <div className="flex items-center gap-2 text-white/40"><Loader2 className="h-4 w-4 animate-spin" /> Generating…</div>
              ) : results[k.id] ? (
                <motion.pre initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-pre-wrap break-words">{results[k.id]}</motion.pre>
              ) : (
                <span className="text-white/35">Click generate to draft a {k.label.toLowerCase()}.</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
