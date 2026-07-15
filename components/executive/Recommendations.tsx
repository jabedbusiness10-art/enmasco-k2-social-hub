"use client";

import { Sparkles } from "lucide-react";

/**
 * TASK-58 — Executive AI Recommendations.
 * Derived from REAL snapshot deltas. Clearly labelled as AI-generated.
 * Never fabricates a metric — only comments on data that actually exists.
 */
export default function Recommendations({ data }: { data: any }) {
  const recs: string[] = [];
  const ai = data.aiIntel;
  const media = data.mediaIntel;
  const queue = data.queueIntel;
  const overview = data.overview;
  const campaigns = data.campaignIntel;

  if (overview?.available && overview.followers != null) {
    if (overview.growthPct != null && overview.growthPct < 0)
      recs.push(`Facebook reach is dropping (${overview.growthPct}%). Review top-performing post timing.`);
    else recs.push(`Facebook audience is stable at ${overview.followers} followers. Keep posting 3×/week.`);
  }
  if (ai?.available) recs.push(`AI handled ${ai.totalRequests} requests across ${Object.keys(ai.byModule ?? {}).length} modules. Consider automating more replies.`);
  if (media?.available && media.unusedAssets > 0)
    recs.push(`${media.unusedAssets} media asset(s) are unused. Repurpose them in upcoming posts.`);
  if (queue?.failedJobs > 0) recs.push(`${queue.failedJobs} background job(s) failed. Open Queue Engine → Failed Jobs to retry.`);
  if (campaigns && !campaigns.available) recs.push(`No campaigns created yet. Launch a campaign to track conversions & leads.`);
  if (recs.length === 0) recs.push(`Not enough activity yet to generate insights. Connect platforms and run jobs to populate recommendations.`);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-violet-300">
        <Sparkles className="h-3.5 w-3.5" /> AI-generated insights (based on real data)
      </div>
      <ul className="space-y-1.5">
        {recs.map((r, i) => (
          <li key={i} className="rounded-xl border border-violet-400/15 bg-violet-400/[0.05] px-3 py-2 text-xs text-white/80">
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}
