import { ReactNode } from "react";
import { LAYOUT_TOKENS } from "@/lib/layout-tokens";

type Size = "small" | "medium" | "large" | "full";

const SIZE_CLASS: Record<Size, string> = {
  small: "max-w-[640px]",
  medium: "max-w-[1024px]",
  large: "max-w-[1600px]",
  full: "max-w-full",
};

/**
 * Container — reusable width system (PART 6).
 * Small / Medium / Large / Full. Never hardcode widths in pages.
 */
export function Container({
  size = "large",
  className = "",
  children,
}: {
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return <div className={`mx-auto w-full ${SIZE_CLASS[size]} ${className}`}>{children}</div>;
}
