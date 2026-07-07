import { ReactNode } from "react";

interface GlassCardProps {
  children?: ReactNode;
  className?: string;
}

export default function GlassCard({
  children,
  className = "",
}: GlassCardProps) {
  return (
    <div
      className={`
        rounded-3xl
        border border-white/10
        bg-white/[0.03]
        backdrop-blur-xl
        shadow-[0_0_40px_rgba(255,0,0,0.05)]
        transition-all
        duration-300
        hover:border-red-500/30
        hover:shadow-[0_0_50px_rgba(255,0,0,0.12)]
        ${className}
      `}
    >
      {children}
    </div>
  );
}
