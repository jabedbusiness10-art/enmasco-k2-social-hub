import { ReactNode } from "react";

type Cols = 1 | 2 | 3 | 4 | 5 | 6;

const GRID_BASE = "grid w-full";

// Responsive column maps (PART 7). Mobile-first; columns grow with breakpoint.
// Default responsive ramp: 1 (base) → sm → lg → xl.
const RAMP: Record<Cols, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
};

/**
 * ResponsiveGrid — single reusable grid system (PART 7).
 * Replaces inconsistent per-page grids. Equal-height cards via items-stretch.
 * @param cols   target columns at the largest breakpoint (1-6)
 * @param gap    tailwind gap utility (e.g. "gap-4", "gap-6")
 */
export function ResponsiveGrid({
  cols = 3,
  gap = "gap-4",
  className = "",
  children,
}: {
  cols?: Cols;
  gap?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`${GRID_BASE} ${RAMP[cols]} ${gap} items-stretch ${className}`}>{children}</div>
  );
}
