"use client";

import { ReactNode, forwardRef } from "react";

type ButtonProps = {
  children?: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  className?: string;
  onClick?: () => void;
};

const variantClass: Record<string, string> = {
  primary: "border-white/10 bg-white/5 text-white hover:bg-white/10",
  secondary: "border-white/10 bg-white/5 text-white/80 hover:bg-white/10",
  danger: "border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20",
  ghost: "border-transparent bg-transparent text-white/70 hover:bg-white/10",
  outline: "border-white/20 bg-transparent text-white hover:bg-white/10",
};

export default forwardRef<HTMLButtonElement, ButtonProps>(function Button({ children, variant = "primary", className = "", onClick }, ref) {
  return (
    <button ref={ref} onClick={onClick} className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${variantClass[variant]} ${className}`}>
      {children}
    </button>
  );
});
