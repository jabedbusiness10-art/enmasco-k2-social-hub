export const typography = {
  fontFamily: {
    sans: "'Inter', 'Geist', ui-sans-serif, system-ui, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
  },
  fontSize: {
    xs: ["0.75rem", { lineHeight: "1rem" }],
    sm: ["0.875rem", { lineHeight: "1.25rem" }],
    base: ["1rem", { lineHeight: "1.5rem" }],
    lg: ["1.125rem", { lineHeight: "1.75rem" }],
    xl: ["1.5rem", { lineHeight: "2rem" }],
    "2xl": ["2.25rem", { lineHeight: "2.5rem" }],
  } as const,
} as const;
