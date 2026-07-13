/**
 * K2KAI Social Flow — Enterprise Layout Tokens (Foundation v1.0)
 * ---------------------------------------------------------------------------
 * Single source of truth for all layout dimensions.
 * Every layout component (AppShell, Sidebar, TopBar, InfoBar, Content Wrapper,
 * Grid, Container) MUST consume these tokens. NO hardcoded magic numbers in
 * layout CSS — reference a token instead.
 *
 * Spacing scale = 4px base (Tailwind default). Use the SPACING map when a
 * component needs a token-driven value instead of a utility class.
 */

export const LAYOUT_TOKENS = {
  /** Sidebar */
  sidebar: {
    widthExpanded: 280, // px
    widthCollapsed: 72, // px
    transition: "0.3s cubic-bezier(0.4, 0, 0.2, 1)", // ease-in-out
  },

  /** Global Top Header */
  header: {
    height: 64, // px (h-16)
    minHeight: 64,
    transition: "0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },

  /** Enterprise Information Bar (framework, sits below header) */
  infoBar: {
    height: 40, // px
    autoRefreshMs: 30000, // future API polling cadence
  },

  /** Main content area */
  content: {
    maxWidth: 1600, // px (Large container default)
    paddingX: 32, // px (px-8)
    paddingTop: 24, // px (pt-6)
    paddingBottom: 32, // px (pb-8)
    gap: 20, // px (space-y-5)
  },

  /** Reusable container sizes (PART 6) */
  container: {
    small: 640, // px
    medium: 1024, // px
    large: 1600, // px
    full: "100%",
  },

  /** Border radius scale */
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    "3xl": 28,
  },

  /** Animation / transition */
  motion: {
    durationFast: 150, // ms
    durationBase: 300, // ms
    durationSlow: 520, // ms
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    // framer-motion arrays
    easingArray: [0.22, 1, 0.36, 1] as [number, number, number, number],
  },

  /** 8px spacing scale (PART 9) */
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
  },

  /** z-index layering */
  z: {
    sidebar: 40,
    header: 50,
    infoBar: 45,
    notification: 60,
    modal: 70,
  },
} as const;

export type LayoutTokens = typeof LAYOUT_TOKENS;

/** Helper: px string for inline styles */
export const px = (n: number | string) => (typeof n === "number" ? `${n}px` : n);

/** Tailwind class fragments derived from tokens (keeps utilities in sync) */
export const LAYOUT_CLASSES = {
  // Sidebar
  sidebarExpanded: `w-[280px]`,
  sidebarCollapsed: `w-[72px]`,
  // Header
  headerHeight: `min-h-16`,
  // Content wrapper
  contentWrapper: `mx-auto w-full max-w-[1600px] px-8 pb-8 pt-6`,
  // Modal/notification layers
  layerOverlay: `fixed inset-0 z-[70]`,
} as const;
