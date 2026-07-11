"use client";

interface HeatmapProps {
  /** 7 rows (days) x 24 cols (hours), values 0-100. */
  matrix: number[][];
  className?: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function cellColor(v: number): string {
  // red-tinted intensity ramp matching the enterprise palette
  if (v <= 0) return "rgba(255,255,255,0.04)";
  const a = Math.min(0.85, 0.12 + v / 100);
  return `rgba(251,113,133,${a.toFixed(2)})`;
}

export default function Heatmap({ matrix, className = "" }: HeatmapProps) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <div className="min-w-[560px]">
        <div className="mb-1 flex gap-[3px] pl-8">
          {Array.from({ length: 24 }).map((_, h) => (
            <div key={h} className="flex-1 text-center text-[8px] text-white/30">
              {h % 3 === 0 ? h : ""}
            </div>
          ))}
        </div>
        {matrix.map((row, d) => (
          <div key={d} className="mb-[3px] flex items-center gap-[3px]">
            <span className="w-7 shrink-0 text-[9px] font-medium text-white/40">{DAYS[d]}</span>
            {row.map((v, h) => (
              <div
                key={h}
                title={`${DAYS[d]} ${h}:00 — activity ${v}`}
                className="h-4 flex-1 rounded-[3px]"
                style={{ background: cellColor(v) }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
