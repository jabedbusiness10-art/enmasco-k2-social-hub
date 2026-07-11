// Compact number formatting for analytics (e.g. 1.2M, 12.3K, 940).

export function compact(n: number): string {
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return trim(n / 1_000_000) + "M";
  if (abs >= 1_000) return trim(n / 1_000) + "K";
  return String(Math.round(n));
}

export function pct(n: number): string {
  return `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;
}

function trim(v: number): string {
  return v
    .toFixed(1)
    .replace(/\.0$/, "")
    .replace(/(\.\d)0$/, "$1");
}

export function full(n: number): string {
  return n.toLocaleString("en-US");
}
