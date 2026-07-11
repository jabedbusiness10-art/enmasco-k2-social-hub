"use client";

import { Sparkles, Clock, TrendingUp } from "lucide-react";
import Panel from "./Panel";
import PlatformIcon from "@/components/content-planner/PlatformIcon";
import type { AiInsight } from "@/types/analytics";

export default function AiInsightsPanel({ ai }: { ai: AiInsight }) {
  return (
    <Panel
      title="AI Insights"
      subtitle="Generated recommendations (mock)"
      action={
        <span className="flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
          <Sparkles className="h-3 w-3" /> K2Kai
        </span>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <InsightTile icon={<TrendingUp className="h-4 w-4 text-sky-300" />} label="Best Content Type" value={ai.bestContentType} />
          <InsightTile icon={<Clock className="h-4 w-4 text-rose-300" />} label="Recommended Time" value={ai.recommendedPostingTime} />
          <InsightTile
            icon={<PlatformIcon platform={ai.suggestedPlatform} size={14} />}
            label="Suggested Platform"
            value={ai.suggestedPlatform}
          />
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="text-[11px] font-medium uppercase tracking-wide text-white/50">Performance Summary</div>
          <p className="mt-1 text-sm leading-relaxed text-white/75">{ai.performanceSummary}</p>
        </div>

        <div>
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-white/50">Recommendations</div>
          <ul className="space-y-1.5">
            {ai.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/75">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-sky-500 to-rose-500" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}

function InsightTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-white/45">{icon} {label}</div>
      <div className="mt-1 text-sm font-semibold capitalize text-white">{value}</div>
    </div>
  );
}
