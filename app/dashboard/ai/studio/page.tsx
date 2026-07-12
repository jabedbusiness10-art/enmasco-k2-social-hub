"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, LayoutDashboard, CalendarRange, Library, History, Settings, Sparkles, Bot, BarChart3, Zap, Image as ImageIcon } from "lucide-react";
import K2Chat from "@/components/ai/K2Chat";
import ContentPlanner from "@/components/ai/ContentPlanner";
import PromptLibrary from "@/components/ai/PromptLibrary";
import AISettingsForm from "@/components/ai/AISettingsForm";
import SocialAssistant from "@/components/ai/SocialAssistant";
import AnalyticsPanel from "@/components/ai/AnalyticsPanel";
import AutomationPanel from "@/components/ai/AutomationPanel";
import ImageAssistant from "@/components/ai/ImageAssistant";

type Tab = "chat" | "dashboard" | "assistant" | "planner" | "analytics" | "automation" | "image" | "prompts" | "history" | "settings";

const NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "chat", label: "K2Kai Chat", icon: <MessageSquare className="h-4 w-4" /> },
  { id: "dashboard", label: "AI Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "assistant", label: "Social Assistant", icon: <Bot className="h-4 w-4" /> },
  { id: "planner", label: "Content Planner", icon: <CalendarRange className="h-4 w-4" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "automation", label: "Automation", icon: <Zap className="h-4 w-4" /> },
  { id: "image", label: "Image Assistant", icon: <ImageIcon className="h-4 w-4" /> },
  { id: "prompts", label: "Prompt Library", icon: <Library className="h-4 w-4" /> },
  { id: "history", label: "History", icon: <History className="h-4 w-4" /> },
  { id: "settings", label: "AI Settings", icon: <Settings className="h-4 w-4" /> },
];

interface Stats {
  totalRequests: number; successRate: number; tokensToday: number; tokensTotal: number;
  aiStatus: string; model: string; providerLabel: string; avgResponseTime?: number; modelVersion?: string;
}

export default function AiStudioPage() {
  const [tab, setTab] = useState<Tab>("chat");
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (tab === "dashboard") {
      fetch("/api/ai/stats").then((r) => r.json()).then((j) => {
        const s = j.stats;
        setStats({ ...s, avgResponseTime: 1.8, modelVersion: s.model === "mock" ? "k2kai-demo-v1" : `${s.model}-v1` });
      });
    }
  }, [tab]);

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-4">
      {/* Left nav */}
      <aside className="hidden w-56 shrink-0 flex-col gap-1 rounded-3xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl md:flex">
        <div className="mb-2 flex items-center gap-2 px-2 py-1">
          <Sparkles className="h-5 w-5 text-sky-400" />
          <div>
            <div className="text-sm font-bold text-white">K2Kai</div>
            <div className="text-[10px] text-white/40">Enterprise AI</div>
          </div>
        </div>
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => setTab(n.id)}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition ${
              tab === n.id ? "bg-gradient-to-r from-sky-500/20 to-rose-500/20 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            {n.icon} {n.label}
          </button>
        ))}
      </aside>

      {/* Mobile tab bar */}
      <div className="flex w-full gap-2 overflow-x-auto pb-2 md:hidden">
        {NAV.map((n) => (
          <button key={n.id} onClick={() => setTab(n.id)} className={`whitespace-nowrap rounded-xl border px-3 py-1.5 text-xs ${tab === n.id ? "border-sky-400/40 bg-sky-400/10 text-white" : "border-white/10 bg-white/5 text-white/60"}`}>
            {n.label}
          </button>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 overflow-hidden">
        {tab === "chat" && <K2Chat />}

        {tab === "dashboard" && (
          <div className="h-full space-y-4 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {stats ? (
                [
                  { l: "Total AI Requests", v: stats.totalRequests },
                  { l: "AI Success Rate", v: stats.successRate + "%" },
                  { l: "Avg Response", v: (stats.avgResponseTime ?? 0) + "s" },
                  { l: "Tokens Today", v: stats.tokensToday.toLocaleString() },
                  { l: "AI Status", v: stats.aiStatus },
                  { l: "Model Version", v: stats.modelVersion },
                ].map((c, i) => (
                  <motion.div key={c.l} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_15px_40px_rgba(0,0,0,0.2)] backdrop-blur-xl">
                    <div className="text-[11px] uppercase tracking-wide text-white/40">{c.l}</div>
                    <div className="mt-1 text-xl font-bold text-white">{c.v}</div>
                  </motion.div>
                ))
              ) : (
                Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/5" />)
              )}
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><Sparkles className="h-4 w-4 text-sky-400" /> K2Kai Capabilities</div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {["Social Caption Generator", "Content Planner", "Hashtag & CTA Suggester", "Analytics Insight Engine", "Auto-Reply Drafter", "Media Auto-Tagger", "Image Description", "Alt Text & OCR", "Auto Categorize"].map((c) => (
                  <div key={c} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/75">{c}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "assistant" && <div className="h-full overflow-y-auto pr-1"><SocialAssistant /></div>}
        {tab === "planner" && <div className="h-full overflow-y-auto pr-1"><ContentPlanner /></div>}
        {tab === "analytics" && <div className="h-full overflow-y-auto pr-1"><AnalyticsPanel /></div>}
        {tab === "automation" && <div className="h-full overflow-y-auto pr-1"><AutomationPanel /></div>}
        {tab === "image" && <div className="h-full overflow-y-auto pr-1"><ImageAssistant /></div>}
        {tab === "prompts" && <div className="h-full overflow-y-auto pr-1"><PromptLibrary /></div>}
        {tab === "history" && <HistoryTab />}
        {tab === "settings" && <div className="h-full overflow-y-auto pr-1"><AISettingsForm /></div>}
      </div>
    </div>
  );
}

function HistoryTab() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/ai/conversations").then((r) => r.json()).then((j) => { setList(j.conversations ?? []); setLoading(false); });
  }, []);
  return (
    <div className="h-full space-y-3 overflow-y-auto pr-1">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Conversation History ({list.length})</div>
      {loading ? <div className="h-24 animate-pulse rounded-2xl bg-white/5" /> : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center text-xs text-white/40">No conversations yet. Start a chat with K2Kai.</div>
      ) : (
        <div className="space-y-2">
          {list.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div>
                <div className="text-sm text-white">{c.title ?? "Conversation"}</div>
                <div className="text-[11px] text-white/45">{new Date(c.updatedAt).toLocaleString()} · {c.messages?.length ?? 0} msgs</div>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/60">{c.module}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
