"use client";

import Panel from "./Panel";
import SparkLine from "./charts/SparkLine";
import MiniBars from "./charts/MiniBars";
import DonutChart from "./charts/DonutChart";
import Heatmap from "./charts/Heatmap";
import { compact, full } from "./format";
import type { AnalyticsDataset } from "@/types/analytics";
import PlatformIcon from "@/components/content-planner/PlatformIcon";

const REACH_COLOR = "#38BDF8";
const ENG_COLOR = "#FB7185";

function trendDelta(series: { value: number }[]): number {
  if (series.length < 2) return 0;
  const last = series[series.length - 1].value;
  const prev = series[series.length - 8 < 0 ? 0 : series.length - 8].value || 1;
  return ((last - prev) / prev) * 100;
}

export default function ChartsGrid({ data }: { data: AnalyticsDataset }) {
  const reachDelta = trendDelta(data.reachTrend);
  const engDelta = trendDelta(data.engagementTrend);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Panel title="Reach Trend" subtitle={`${compact(data.kpi.totalReach)} total reach`} action={<DeltaChip v={reachDelta} />}>
        <SparkLine data={data.reachTrend} color={REACH_COLOR} area />
      </Panel>

      <Panel title="Engagement Trend" subtitle={`${compact(data.kpi.totalEngagement)} total engagements`} action={<DeltaChip v={engDelta} />}>
        <SparkLine data={data.engagementTrend} color={ENG_COLOR} area />
      </Panel>

      <Panel title="Platform Performance" subtitle="Reach by platform">
        <MiniBars
          height={200}
          data={data.platformPerf.map((p) => ({
            label: p.platform.slice(0, 3),
            value: p.reach,
            color: "linear-gradient(180deg,#38BDF8,#FB7185)",
          }))}
        />
      </Panel>

      <Panel title="Content Distribution" subtitle="Posts by platform">
        <DonutChart data={data.distribution} />
      </Panel>

      <Panel title="Posting Activity Heatmap" subtitle="Intensity by day & hour" className="lg:col-span-2">
        <Heatmap matrix={data.heatmap} />
      </Panel>

      <Panel title="Audience Growth Timeline" subtitle={`${full(data.audienceGrowth[data.audienceGrowth.length - 1].followers)} followers`} className="lg:col-span-2">
        <SparkLine data={data.audienceGrowth.map((g) => ({ label: g.label, value: g.followers }))} color="#34D399" />
      </Panel>
    </div>
  );
}

function DeltaChip({ v }: { v: number }) {
  const up = v >= 0;
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${up ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
      {up ? "▲" : "▼"} {Math.abs(v).toFixed(1)}%
    </span>
  );
}
