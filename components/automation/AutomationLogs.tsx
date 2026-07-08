"use client";

import { motion } from "framer-motion";

type AutomationLogsProps = {
  logs: { id: string; workflow: string; message: string; time: string }[];
};

export default function AutomationLogs({ logs }: AutomationLogsProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04]">
      <div className="border-b border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/60">Automation Logs</div>
      <div className="divide-y divide-white/5">
        {logs.map((log, index) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 text-xs text-white/80"
          >
            <div>
              <div className="text-white">{log.workflow}</div>
              <div className="text-white/60">{log.message}</div>
            </div>
            <div className="text-white/60">{log.time}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
