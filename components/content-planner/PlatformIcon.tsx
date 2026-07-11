"use client";

import type { PlatformKey } from "@/types/contentPlanner";

const META: Record<PlatformKey, { name: string; color: string; short: string; text: string }> = {
  facebook: { name: "Facebook", color: "#1877F2", short: "f", text: "#fff" },
  instagram: { name: "Instagram", color: "#E4405F", short: "ig", text: "#fff" },
  linkedin: { name: "LinkedIn", color: "#0A66C2", short: "in", text: "#fff" },
  x: { name: "X", color: "#E7E9EA", short: "X", text: "#0b0b0f" },
  youtube: { name: "YouTube", color: "#FF0000", short: "▶", text: "#fff" },
  tiktok: { name: "TikTok", color: "#FE2C55", short: "♪", text: "#fff" },
};

export function platformMeta(key: PlatformKey) {
  return META[key];
}

export default function PlatformIcon({
  platform,
  size = 18,
  className = "",
}: {
  platform: PlatformKey;
  size?: number;
  className?: string;
}) {
  const m = META[platform];
  return (
    <span
      title={m.name}
      className={`inline-flex shrink-0 items-center justify-center rounded-md font-bold leading-none ${className}`}
      style={{
        width: size + 8,
        height: size + 8,
        background: m.color,
        color: m.text,
        fontSize: Math.max(9, size - 6),
      }}
    >
      {m.short}
    </span>
  );
}
