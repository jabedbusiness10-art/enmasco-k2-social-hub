"use client";

import { useEffect, useRef, useState } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type {
  ChartPoint,
  PlatformDatum,
  ReactionDatum,
  EngagementPlatform,
} from "@/types/engagement";
import { PLATFORM_LABELS } from "@/data/engagement";

const RED = "#F87171";
const GRID = "rgba(255,255,255,0.06)";
const AXIS = "rgba(255,255,255,0.45)";

const PLATFORM_COLORS: Record<EngagementPlatform, string> = {
  facebook: "#60A5FA",
  instagram: "#F472B6",
  linkedin: "#60A5FA",
  x: "#A3A3A3",
  tiktok: "#22D3EE",
  youtube: "#F87171",
};

const REACTION_COLORS = [
  "#F87171",
  "#F472B6",
  "#FBBF24",
  "#34D399",
  "#60A5FA",
  "#A78BFA",
  "#22D3EE",
  "#FB923C",
  "#94A3B8",
];

const H = 200;

function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (!ref.current) return;
    const update = () => setW(Math.floor(ref.current?.clientWidth || 0));
    const ro = new ResizeObserver(update);
    ro.observe(ref.current);
    update();
    return () => ro.disconnect();
  }, []);
  return { ref, w: w || 320, mounted };
}

function Card({
  title,
  children,
}: {
  title: string;
  children: (width: number) => React.ReactNode;
}) {
  const { ref, w, mounted } = useWidth();
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
      <h3 className="mb-3 text-sm font-semibold text-white">{title}</h3>
      <div ref={ref} className="w-full" style={{ height: H }}>
        {mounted ? children(w) : <div className="h-full w-full animate-pulse rounded-lg bg-white/[0.04]" />}
      </div>
    </div>
  );
}

const tooltipStyle = {
  background: "rgba(10,10,12,0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 12,
  color: "#fff",
};

export default function EngagementCharts({
  daily,
  weekly,
  monthly,
  platformComparison,
  reactionDistribution,
  growthTrend,
}: {
  daily: ChartPoint[];
  weekly: ChartPoint[];
  monthly: ChartPoint[];
  platformComparison: PlatformDatum[];
  reactionDistribution: ReactionDatum[];
  growthTrend: ChartPoint[];
}) {
  const platformData = platformComparison.map((p) => ({
    name: PLATFORM_LABELS[p.platform],
    value: p.value,
    fill: PLATFORM_COLORS[p.platform],
  }));

  const reactionData = reactionDistribution.map((r, i) => ({
    name: r.type,
    value: r.value,
    fill: REACTION_COLORS[i % REACTION_COLORS.length],
  }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card title="Daily Engagement">
        {(w) => (
          <AreaChart width={w} height={H} data={daily} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="gDaily" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={RED} stopOpacity={0.4} />
                <stop offset="100%" stopColor={RED} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="label" stroke={AXIS} fontSize={11} />
            <YAxis stroke={AXIS} fontSize={11} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="value" stroke={RED} strokeWidth={2} fill="url(#gDaily)" />
          </AreaChart>
        )}
      </Card>

      <Card title="Weekly Engagement">
        {(w) => (
          <LineChart width={w} height={H} data={weekly} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="label" stroke={AXIS} fontSize={11} />
            <YAxis stroke={AXIS} fontSize={11} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="value" stroke={RED} strokeWidth={2.5} dot={{ r: 3, fill: RED }} />
          </LineChart>
        )}
      </Card>

      <Card title="Monthly Engagement">
        {(w) => (
          <AreaChart width={w} height={H} data={monthly} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="gMonthly" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={RED} stopOpacity={0.4} />
                <stop offset="100%" stopColor={RED} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="label" stroke={AXIS} fontSize={11} />
            <YAxis stroke={AXIS} fontSize={11} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="value" stroke={RED} strokeWidth={2} fill="url(#gMonthly)" />
          </AreaChart>
        )}
      </Card>

      <Card title="Platform Comparison">
        {(w) => (
          <BarChart width={w} height={H} data={platformData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="name" stroke={AXIS} fontSize={11} />
            <YAxis stroke={AXIS} fontSize={11} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {platformData.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        )}
      </Card>

      <Card title="Reaction Distribution">
        {(w) => (
          <PieChart width={w} height={H}>
            <Tooltip contentStyle={tooltipStyle} />
            <Pie
              data={reactionData}
              dataKey="value"
              nameKey="name"
              innerRadius={42}
              outerRadius={72}
              paddingAngle={2}
            >
              {reactionData.map((d, i) => (
                <Cell key={i} fill={d.fill} stroke="rgba(0,0,0,0.3)" />
              ))}
            </Pie>
          </PieChart>
        )}
      </Card>

      <Card title="Growth Trend">
        {(w) => (
          <LineChart width={w} height={H} data={growthTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="label" stroke={AXIS} fontSize={11} />
            <YAxis stroke={AXIS} fontSize={11} unit="%" />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="value" stroke="#34D399" strokeWidth={2.5} dot={{ r: 3, fill: "#34D399" }} />
          </LineChart>
        )}
      </Card>
    </div>
  );
}
