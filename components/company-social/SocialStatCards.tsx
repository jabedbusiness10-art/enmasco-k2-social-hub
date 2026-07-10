"use client";

import { motion } from "framer-motion";
import { Link2, HeartPulse, AlarmClock, Unplug, RefreshCw } from "lucide-react";

export default function SocialStatCards({
  connected,
  healthy,
  expiring,
  disconnected,
  lastSync,
}: {
  connected: number;
  healthy: number;
  expiring: number;
  disconnected: number;
  lastSync: string | null;
}) {
  const stats = [
    { label: "Connected Accounts", value: connected, icon: <Link2 className="h-4 w-4" />, color: "text-sky-300" },
    { label: "Healthy Connections", value: healthy, icon: <HeartPulse className="h-4 w-4" />, color: "text-emerald-300" },
    { label: "Expiring Soon", value: expiring, icon: <AlarmClock className="h-4 w-4" />, color: "text-amber-300" },
    { label: "Disconnected", value: disconnected, icon: <Unplug className="h-4 w-4" />, color: "text-red-300" },
    { label: "Last Synchronization", value: lastSync ? new Date(lastSync).toLocaleTimeString() : "—", icon: <RefreshCw className="h-4 w-4" />, color: "text-white/80", raw: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.04 }}
          whileHover={{ y: -3 }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_15px_40px_rgba(0,0,0,0.2)] backdrop-blur-xl"
        >
          <div className={`flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/45 ${s.color}`}>
            {s.icon}
            {s.label}
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{s.value}</div>
        </motion.div>
      ))}
    </div>
  );
}
