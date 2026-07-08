"use client";

import { motion } from "framer-motion";

type MonitoringPanelProps = {
  queueSize: number;
  workers: number;
  memory: string;
  cpu: string;
  health: string;
  uptime: string;
};

export default function MonitoringPanel({ queueSize, workers, memory, cpu, health, uptime }: MonitoringPanelProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Monitoring</div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/80">
        <div>Queue Size<div className="text-white font-semibold">{queueSize}</div></div>
        <div>Workers<div className="text-white font-semibold">{workers}</div></div>
        <div>Memory<div className="text-white font-semibold">{memory}</div></div>
        <div>CPU<div className="text-white font-semibold">{cpu}</div></div>
        <div>Health<div className="text-white font-semibold">{health}</div></div>
        <div>Uptime<div className="text-white font-semibold">{uptime}</div></div>
      </div>
    </div>
  );
}
