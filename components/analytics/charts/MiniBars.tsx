"use client";

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  className?: string;
}

export default function MiniBars({ data, height = 220, className = "" }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className={`flex w-full items-end gap-2 ${className}`} style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
          <div className="group relative flex w-full justify-center">
            <div
              className="w-full rounded-t-md transition-all"
              style={{
                height: `${(d.value / max) * (height - 28)}px`,
                background: d.color ?? "linear-gradient(180deg, #38BDF8, #FB7185)",
                minHeight: 4,
              }}
            />
          </div>
          <span className="text-[9px] uppercase tracking-wide text-white/40">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
