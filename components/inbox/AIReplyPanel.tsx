"use client";

import { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  Languages,
  Briefcase,
  Smile,
  Minus,
  AlignLeft,
  Wand2,
  Copy,
  Check,
  Loader2,
} from "lucide-react";

type Tone = "professional" | "friendly" | "short" | "detailed";
type Lang = "en" | "ar" | "bn";

const LANG_LABEL: Record<Lang, string> = { en: "English", ar: "Arabic", bn: "Bangla" };

const ENMASCO_SYSTEM = `You are the K2KAI Enterprise AI Communication Assistant for ENMASCO (Enma Security Trading Co.), a security/surveillance company in Saudi Arabia.
Products: Hikvision, EZVIZ, Dahua, NVR, DVR, Access Control, Intercom, Solar Camera, Fingerprint, Networking, Smart Home.
Rules (Safety Guard):
- Never invent prices, discounts, warranties, or technical specs you are unsure of. Say "please contact our team for exact pricing."
- Be polite, professional, and concise.
- Support English, Arabic, and Bangla. Match the customer's language.
- Never promise things ENMASCO cannot deliver.`;

function buildPrompt(customerText: string, tone: Tone, lang: Lang, mode: "reply" | "summary" | "sentiment" | "intent" | "translate", translateTo?: Lang) {
  const langName = LANG_LABEL[lang];
  if (mode === "reply") {
    const toneGuide: Record<Tone, string> = {
      professional: "Professional and formal",
      friendly: "Friendly and warm",
      short: "Very short (1 sentence)",
      detailed: "Detailed and helpful",
    };
    return `Customer said (in their language): """${customerText}"""
Generate ONE ${toneGuide[tone]} reply in ${langName}. Only return the reply text, no labels.`;
  }
  if (mode === "summary") {
    return `Summarize this conversation briefly in ${langName}. List what the customer asked about and the recommended next step:
"""${customerText}"""`;
  }
  if (mode === "sentiment") {
    return `Classify the sentiment of this message. Reply with ONLY one word from: Positive, Neutral, Angry, Question, Lead, Urgent.
Message: """${customerText}"""`;
  }
  if (mode === "intent") {
    return `Classify the customer intent. Reply with ONLY the best matching label from: Price Inquiry, Technical Support, Installation, Warranty, Complaint, Sales Lead, Order Status, Product Information, Quotation, Maintenance.
Message: """${customerText}"""`;
  }
  if (mode === "translate") {
    return `Translate this to ${LANG_LABEL[translateTo ?? "en"]}. Only return the translation:
"""${customerText}"""`;
  }
  return customerText;
}

export default function AIReplyPanel({
  onApply,
  customerMessage = "",
}: {
  onApply: (text: string) => void;
  customerMessage?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [lang, setLang] = useState<Lang>("en");
  const [sentiment, setSentiment] = useState<string | null>(null);
  const [intent, setIntent] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [translated, setTranslated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const ctx = customerMessage?.trim() || "Hi, I need help with a security camera for my shop.";

  async function callAI(prompt: string): Promise<string> {
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, systemPrompt: ENMASCO_SYSTEM, maxTokens: 400 }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "AI request failed");
    return json.result ?? "";
  }

  async function generateReplies() {
    setLoading(true);
    setError(null);
    try {
      const tones: Tone[] = ["professional", "friendly", "short"];
      const results = await Promise.all(
        tones.map((t) => callAI(buildPrompt(ctx, t, lang, "reply")))
      );
      setSuggestions(results);
      // also detect sentiment + intent in parallel
      const [s, i] = await Promise.all([
        callAI(buildPrompt(ctx, "professional", lang, "sentiment")),
        callAI(buildPrompt(ctx, "professional", lang, "intent")),
      ]);
      setSentiment(s.trim());
      setIntent(i.trim());
    } catch (e: any) {
      setError(e.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function doSummary() {
    setLoading(true);
    setError(null);
    try {
      setSummary(await callAI(buildPrompt(ctx, "professional", lang, "summary")));
    } catch (e: any) {
      setError(e.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function doTranslate(to: Lang) {
    setLoading(true);
    setError(null);
    try {
      setTranslated(await callAI(buildPrompt(ctx, "professional", lang, "translate", to)));
      setLang(to);
    } catch (e: any) {
      setError(e.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function rewrite(tone: Tone) {
    if (!suggestions[0]) return;
    setLoading(true);
    setError(null);
    try {
      const r = await callAI(buildPrompt(suggestions.join("\n"), tone, lang, "reply"));
      setSuggestions([r]);
    } catch (e: any) {
      setError(e.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  }

  function copy(text: string) {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <Sparkles className="h-4 w-4 text-violet-300" strokeWidth={1.8} />
        <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
        <span className="ml-auto rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-200">
          Live
        </span>
      </div>

      {/* Language */}
      <div className="mt-3 flex items-center gap-1.5">
        <Languages className="h-3.5 w-3.5 text-white/50" />
        {(["en", "ar", "bn"] as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`rounded-lg px-2 py-1 text-[11px] font-medium transition ${
              lang === l ? "bg-violet-500/20 text-white" : "bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            {LANG_LABEL[l]}
          </button>
        ))}
      </div>

      {/* Analyze row */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        <button
          onClick={generateReplies}
          disabled={loading}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-violet-400/30 bg-violet-500/15 px-2.5 py-2 text-[11px] font-semibold text-white transition hover:bg-violet-500/25 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
          Generate Reply
        </button>
        <button
          onClick={doSummary}
          disabled={loading}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-[11px] font-medium text-white/75 transition hover:bg-white/10 disabled:opacity-50"
        >
          <AlignLeft className="h-3.5 w-3.5" /> Summarize
        </button>
      </div>

      {error && <div className="mt-2 text-[11px] text-rose-300">{error}</div>}

      {/* Sentiment + Intent */}
      {(sentiment || intent) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {sentiment && (
            <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-white/70">
              😊 {sentiment}
            </span>
          )}
          {intent && (
            <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-white/70">
              🎯 {intent}
            </span>
          )}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-3 space-y-2">
          {suggestions.map((s, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-black/20 p-2.5">
              <p className="text-[12px] leading-relaxed text-white/85 whitespace-pre-wrap">{s}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <button
                  onClick={() => onApply(s)}
                  className="rounded-lg bg-violet-500/20 px-2 py-1 text-[10px] font-medium text-violet-100 hover:bg-violet-500/30"
                >
                  Insert
                </button>
                <button
                  onClick={() => copy(s)}
                  className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-[10px] text-white/60 hover:text-white"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} Copy
                </button>
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button onClick={() => rewrite("professional")} className="rounded-lg bg-white/5 px-2 py-1 text-[10px] text-white/60 hover:text-white">Professional</button>
            <button onClick={() => rewrite("friendly")} className="rounded-lg bg-white/5 px-2 py-1 text-[10px] text-white/60 hover:text-white">Friendly</button>
            <button onClick={() => rewrite("short")} className="rounded-lg bg-white/5 px-2 py-1 text-[10px] text-white/60 hover:text-white">Short</button>
            <button onClick={() => rewrite("detailed")} className="rounded-lg bg-white/5 px-2 py-1 text-[10px] text-white/60 hover:text-white">Detailed</button>
          </div>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-2.5">
          <p className="text-[11px] leading-relaxed text-white/80 whitespace-pre-wrap">{summary}</p>
        </div>
      )}

      {/* Translate */}
      <div className="mt-3 border-t border-white/10 pt-3">
        <div className="mb-1.5 text-[10px] uppercase tracking-wide text-white/40">Translate</div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => doTranslate("en")} className="rounded-lg bg-white/5 px-2 py-1 text-[10px] text-white/60 hover:text-white">→ English</button>
          <button onClick={() => doTranslate("ar")} className="rounded-lg bg-white/5 px-2 py-1 text-[10px] text-white/60 hover:text-white">→ Arabic</button>
          <button onClick={() => doTranslate("bn")} className="rounded-lg bg-white/5 px-2 py-1 text-[10px] text-white/60 hover:text-white">→ Bangla</button>
        </div>
        {translated && (
          <div className="mt-2 rounded-xl border border-white/10 bg-black/20 p-2.5">
            <p className="text-[12px] leading-relaxed text-white/85 whitespace-pre-wrap">{translated}</p>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="mt-3 text-[10px] text-white/30">Human approval required before sending.</div>
    </div>
  );
}
