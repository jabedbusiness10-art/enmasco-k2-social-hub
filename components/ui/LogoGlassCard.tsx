"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoGlassCardProps = {
  className?: string;
};

export default function LogoGlassCard({ className }: LogoGlassCardProps) {
  return (
    <motion.div
      className={cn(
        "relative inline-flex items-center justify-center",
        "h-[72px] w-[72px] rounded-[18px]",
        "border border-white/[0.05]",
        "bg-white/[0.06] backdrop-blur-xl",
        "shadow-[0_8px_24px_rgba(0,0,0,0.45)]",
        className
      )}
      animate={{
        y: [0, -6, 0],
      }}
      transition={{
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "mirror",
      }}
      whileHover={{ scale: 1.05 }}
    >
      {/* Red ambient glow behind */}
      <span
        className="pointer-events-none absolute inset-0 rounded-[18px]"
        style={{
          boxShadow:
            "inset 0 0 0px rgba(220,38,38,0.0), 0 0 0px rgba(220,38,38,0.0)",
          background:
            "radial-gradient(circle at 50% 50%, rgba(220,38,38,0.18) 0%, rgba(220,38,38,0.06) 40%, transparent 70%)",
          filter: "blur(12px) drop-shadow(0 0 18px red)",
        }}
        aria-hidden="true"
      />

      {/* Logo mark */}
      <div className="relative flex items-center justify-center px-1">
        <Image
          src="/logo.png"
          alt="K2KAI official logo"
          width={62}
          height={53}
          className="h-auto w-full object-contain drop-shadow-[0_0_12px_rgba(99,102,241,0.45)]"
        />
      </div>
    </motion.div>
  );
}
