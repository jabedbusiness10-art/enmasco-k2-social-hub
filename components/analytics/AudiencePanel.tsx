"use client";

import Panel from "./Panel";
import MiniBars from "./charts/MiniBars";
import type { AudienceInsight } from "@/types/analytics";

export default function AudiencePanel({ audience }: { audience: AudienceInsight }) {
  const maxCountry = Math.max(...audience.topCountries.map((c) => c.value), 1);
  const maxCity = Math.max(...audience.topCities.map((c) => c.value), 1);
  const deviceTotal = audience.deviceBreakdown.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <Panel title="Audience Insights" subtitle="Where and when your audience engages">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <div className="text-[11px] font-medium text-white/60">Active Hours</div>
          <MiniBars
            height={120}
            data={audience.activeHours.filter((_, i) => i % 2 === 0).map((h) => ({ label: `${h.hour}`, value: h.value, color: "linear-gradient(180deg,#38BDF8,#22D3EE)" }))}
          />
          <div className="mt-3 text-[11px] font-medium text-white/60">Best Posting Time</div>
          <div className="mt-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-semibold text-sky-300">{audience.bestPostingTime}</div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-1.5 text-[11px] font-medium text-white/60">Top Countries</div>
            {audience.topCountries.map((c) => (
              <Row key={c.country} label={c.country} value={c.value} max={maxCountry} />
            ))}
          </div>
          <div>
            <div className="mb-1.5 text-[11px] font-medium text-white/60">Top Cities</div>
            {audience.topCities.map((c) => (
              <Row key={c.city} label={c.city} value={c.value} max={maxCity} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-white/10 pt-3">
        <div className="mb-2 text-[11px] font-medium text-white/60">Device Breakdown</div>
        <div className="flex items-center gap-4">
          <div className="flex flex-1 gap-1.5">
            {audience.deviceBreakdown.map((d) => (
              <div
                key={d.device}
                className="h-2.5 rounded-full"
                style={{ width: `${(d.value / deviceTotal) * 100}%`, background: d.color }}
              />
            ))}
          </div>
          <div className="flex gap-3 text-[11px]">
            {audience.deviceBreakdown.map((d) => (
              <span key={d.device} className="flex items-center gap-1 text-white/60">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                {d.device} {d.value}%
              </span>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function Row({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="mb-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/70">{label}</span>
        <span className="text-white/45">{value}%</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
        <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-rose-500" style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}
