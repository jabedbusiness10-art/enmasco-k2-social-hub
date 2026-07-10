"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wand2, Loader2 } from "lucide-react";

const PLATFORMS = ["Facebook", "Instagram", "LinkedIn", "X", "YouTube"];
const TONES = ["Professional", "Casual", "Playful", "Authoritative", "Friendly"];
const GOALS = ["Awareness", "Engagement", "Leads", "Sales", "Recruitment"];
const LANGS = ["en", "bn", "ar"];

export default function ContentPlanner() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("Security buyers in Saudi Arabia");
  const [tone, setTone] = useState("Professional");
  const [language, setLanguage] = useState("en");
  const [platform, setPlatform] = useState("Instagram");
  const [goal, setGoal] = useState("Awareness");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);

  async function generate() {
    if (!topic.trim() || busy) return;
    setBusy(true);
    setResult("");
    const prompt = `Create a social media content plan.
Topic: ${topic}
Target Audience: ${audience}
Tone: ${tone}
Language: ${language}
Platform: ${platform}
Goal: ${goal}

Output: 3 ready-to-publish variations, each with caption, hashtags, CTA, and a suggested posting time.`;
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemPrompt: "You are K2Kai content strategist for ENMASCO." }),
      });
      const json = await res.json();
      setResult(json.result ?? json.error ?? "No result");
    } catch (e: any) {
      setResult("⚠️ " + (e.message ?? "Failed"));
    } finally {
      setBusy(false);
    }
  }

  const field = "h-9 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none placeholder:text-white/40 focus:border-sky-400/50";

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div>
          <label className="mb-1 block text-xs text-white/60">Topic *</label>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Smart CCTV launch" className={field} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/60">Audience</label>
          <input value={audience} onChange={(e) => setAudience(e.target.value)} className={field} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-white/60">Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)} className={field}>{TONES.map((t) => <option key={t}>{t}</option>)}</select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/60">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className={field}>{LANGS.map((l) => <option key={l}>{l}</option>)}</select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-white/60">Platform</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={field}>{PLATFORMS.map((p) => <option key={p}>{p}</option>)}</select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/60">Goal</label>
            <select value={goal} onChange={(e) => setGoal(e.target.value)} className={field}>{GOALS.map((g) => <option key={g}>{g}</option>)}</select>
          </div>
        </div>
        <button onClick={generate} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} Generate Plan
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Generated Content</div>
        {busy ? (
          <div className="flex h-40 items-center justify-center text-white/40"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : result ? (
          <motion.pre initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-sm text-white/85">{result}</motion.pre>
        ) : (
          <div className="flex h-40 items-center justify-center text-xs text-white/40">Fill the form and generate a content plan.</div>
        )}
      </div>
    </div>
  );
}
