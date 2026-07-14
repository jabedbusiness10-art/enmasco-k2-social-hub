// ===========================================================================
// components/layout/sidebarStyles.ts
// Single source of truth for K2KAI sidebar item / section styling.
// Active, hover, open, collapsed, and focus states all derive from here so
// every sidebar item (Dashboard, Social, Team, Inbox, Media Library,
// Administration, future modules) shares identical height, spacing, and
// focus behavior. Keyboard accessibility is preserved; the browser default
// outline/focus-ring is replaced by our custom enterprise glow.
// ===========================================================================
import { cva } from "class-variance-authority";

export const sidebarBaseItem =
  "relative flex w-full items-center rounded-lg px-3 py-2 text-left transition-all duration-300 " +
  // kill the browser default focus ring / outline — keyboard nav still works
  "focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0";

export const sidebarSectionTrigger = cva(
  [sidebarBaseItem, "border border-transparent bg-white/[0.04] hover:bg-white/[0.08]"],
  {
    variants: {
      state: {
        idle: "text-white/70",
        open: "border-sky-300/30 bg-sky-500/10 text-sky-200 shadow-[0_0_18px_rgba(56,189,248,0.22)]",
        childActive: "text-sky-100",
      },
    },
    defaultVariants: { state: "idle" },
  },
);

export const sidebarItem = cva(
  // subitem carries a transparent border so active state only changes color,
  // never layout. transparent border => no white flash on focus.
  [sidebarBaseItem, "border border-transparent"],
  {
    variants: {
      variant: {
        // top-level section item
        section: "border border-transparent bg-white/[0.04] hover:bg-white/[0.08]",
        // nested submenu item (All Assets / Collections / Tags ...)
        subitem: "ml-1",
      },
      active: {
        true: "border-sky-300/30 bg-sky-500/10 text-sky-200 shadow-[0_0_18px_rgba(56,189,248,0.25)]",
        false: "text-white/70 hover:text-white",
      },
    },
    compoundVariants: [
      { variant: "section", active: false, className: "text-white/70 hover:text-white" },
    ],
    defaultVariants: { variant: "section", active: false },
  },
);
