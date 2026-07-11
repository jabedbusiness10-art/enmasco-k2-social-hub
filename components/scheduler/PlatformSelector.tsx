import type { PlatformKey } from "@/types/scheduler";
import { PLATFORM_LIST, PLATFORMS } from "./platformMeta";

type PlatformSelectorProps = {
  value: PlatformKey;
  onChange: (value: PlatformKey) => void;
  /** show "future" platforms as disabled, greyed chips */
  showFuture?: boolean;
};

export default function PlatformSelector({
  value,
  onChange,
  showFuture = true,
}: PlatformSelectorProps) {
  const items = showFuture ? PLATFORM_LIST : PLATFORM_LIST.filter((p) => !p.future);
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((p) => {
        const active = p.key === value;
        const Icon = p.icon;
        return (
          <button
            key={p.key}
            type="button"
            disabled={p.future}
            onClick={() => !p.future && onChange(p.key)}
            className={`group flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 ${
              active
                ? `border-white/30 bg-white/[0.08] ${p.text} shadow-[0_0_24px_rgba(248,113,113,0.12)]`
                : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:bg-white/[0.06]"
            } ${p.future ? "cursor-not-allowed opacity-40" : ""}`}
          >
            <Icon className="h-4 w-4" strokeWidth={1.8} />
            {p.label}
            {p.future && (
              <span className="rounded-full border border-white/15 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-white/50">
                Soon
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function PlatformIcon({ platform }: { platform: PlatformKey }) {
  const meta = PLATFORMS[platform];
  const Icon = meta.icon;
  return <Icon className={`h-4 w-4 ${meta.text}`} strokeWidth={1.8} />;
}
