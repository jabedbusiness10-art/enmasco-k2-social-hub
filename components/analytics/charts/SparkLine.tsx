"use client";

import { useId } from "react";

interface LineChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  /** Show area fill (so the same primitive serves line + area charts). */
  area?: boolean;
  className?: string;
}

export default function SparkLine({
  data,
  color = "#38BDF8",
  height = 220,
  area = false,
  className = "",
}: LineChartProps) {
  const id = useId().replace(/[:]/g, "");
  if (!data.length) return null;

  const W = 1000;
  const H = 300;
  const pad = 12;
  const max = Math.max(...data.map((d) => d.value)) || 1;
  const min = Math.min(...data.map((d) => d.value));
  const span = max - min || 1;

  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = pad + (1 - (d.value - min) / span) * (H - pad * 2);
    return [x, y] as const;
  });

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const areaPath =
    `${line} L${pts[pts.length - 1][0].toFixed(1)},${H - pad} L${pts[0][0].toFixed(1)},${H - pad} Z`;

  return (
    <div className={`w-full ${className}`}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-[220px] w-full" style={{ height }}>
        <defs>
          <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {area && <path d={areaPath} fill={`url(#grad-${id})`} />}
        <path d={line} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={4} fill={color} />
        ))}
      </svg>
    </div>
  );
}
