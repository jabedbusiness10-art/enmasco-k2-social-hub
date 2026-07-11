"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { type ReactNode } from "react";
import { usePathname } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Core entrance primitives — drop-in replacements for plain divs     */
/* ------------------------------------------------------------------ */

type Dir = "up" | "down" | "left" | "right" | "none";

const offsetFor: Record<Dir, { x?: number; y?: number }> = {
  up: { y: 24 },
  down: { y: -24 },
  left: { x: 24 },
  right: { x: -24 },
  none: {},
};

export function FadeIn({
  children,
  delay = 0,
  direction = "up",
  distance = 24,
  duration = 0.5,
  className,
  once = true,
  ...rest
}: {
  children: ReactNode;
  delay?: number;
  direction?: Dir;
  distance?: number;
  duration?: number;
  className?: string;
  once?: boolean;
} & HTMLMotionProps<"div">) {
  const reduce = useReducedMotion();
  const off = offsetFor[direction];
  const dx = off.x ? (off.x > 0 ? distance : -distance) : 0;
  const dy = off.y ? (off.y > 0 ? distance : -distance) : 0;
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, x: dx, y: dy }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function SlideUp({
  children,
  delay = 0,
  className,
  distance = 28,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  distance?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stagger — parent reveals children one-by-one                      */
/* ------------------------------------------------------------------ */

export function Stagger({
  children,
  className,
  stagger = 0.07,
  delayChildren = 0.05,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  direction = "up",
  distance = 20,
}: {
  children: ReactNode;
  className?: string;
  direction?: Dir;
  distance?: number;
}) {
  const off = offsetFor[direction];
  const dx = off.x ? (off.x > 0 ? distance : -distance) : 0;
  const dy = off.y ? (off.y > 0 ? distance : -distance) : 0;
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, x: dx, y: dy },
        show: { opacity: 1, x: 0, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  HoverGlow — spotlight + lift on any surface                        */
/* ------------------------------------------------------------------ */

export function HoverGlow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors duration-300 hover:border-sky-400/30 ${className}
        before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100
        before:bg-[radial-gradient(420px_circle_at_var(--mx,50%)_var(--my,50%),rgba(56,189,248,0.12),transparent_45%)]`}
      onMouseMove={(e) => {
        const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  PageTransition — re-animates on every route change                 */
/* ------------------------------------------------------------------ */

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  AnimatedBackground — ambient living backdrop                       */
/* ------------------------------------------------------------------ */

export function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* base radial wash */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(56,189,248,0.10),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(248,113,113,0.10),transparent_42%),radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.10),transparent_45%)]" />
      {/* drifting grid */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          animation: "gridDrift 50s linear infinite",
        }}
      />
      {/* floating soft orbs */}
      <div className="orb orb-a absolute h-72 w-72 rounded-full bg-sky-500/20 blur-[120px]" />
      <div className="orb orb-b absolute h-72 w-72 rounded-full bg-rose-500/20 blur-[120px]" />
      <div className="orb orb-c absolute h-72 w-72 rounded-full bg-indigo-500/20 blur-[120px]" />
    </div>
  );
}

