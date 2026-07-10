"use client";

import { motion } from "framer-motion";
import { Activity, Zap, RefreshCw, Webhook, Clock, ShieldCheck } from "lucide-react";
import { HEALTH_SERVICES } from "@/lib/social-ui";

const ICONS: Record<string, React.ReactNode> = {
  meta: <Zap className="h-3.5 w-3.5" />,
  linkedin: <Activity className="h-3.5 w-3.5" />,
  google: <RefreshCw className="h-3.5 w-3.5" />,
  x: <Zap className="h-3.5 w-3.5" />,
  webhook: <Webhook className="h-3.5 w-3.5" />,
  scheduler: <Clock className="h-3.5 w-3.5" />,
  refresh: <ShieldCheck className="h-3.5 w-3.5" />,
};

export default function HealthPanel() {
  const healthy = HEALTH_SERVICES.filter((s) => s.ok).length;
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-4 w-4 text-sky-400" />
        <h3 className="text-sm font-semibold text-white">Connection Health</h3>
        <span className="ml-auto rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
          {healthy}/{HEALTH_SERVICES.length} Operational
        </span>
      </div>
      <div className="space-y-2.5">
        {HEALTH_SERVICES.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
          >
            <div className="flex items-center gap-2 text-xs text-white/75">
              <span className="text-white/50">{ICONS[s.key]}</span>
              {s.label}
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Operational
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
