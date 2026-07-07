import { colors } from "./colors";
import { typography } from "./typography";
import { animations } from "./animations";

export const theme = {
  colors,
  typography,
  animations,
  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    full: "9999px",
  } as const,
  shadows: {
    glow: "0 0 20px rgba(220, 38, 38, 0.25)",
    glowBlue: "0 0 20px rgba(59, 130, 246, 0.25)",
    card: "0 1px 2px rgba(0,0,0,0.4)",
  } as const,
} as const;

export type Theme = typeof theme;
