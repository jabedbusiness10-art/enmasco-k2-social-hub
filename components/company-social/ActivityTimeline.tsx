"use client";

import { motion } from "framer-motion";
import { History } from "lucide-react";
import type { CompanySocialAccount } from "@/types/company-social";
import { PLATFORM_META } from "@/types/company-social";

export default function ActivityTimeline({ accounts }: { accounts: CompanySocialAccount[] }) {
  // Derive recent events from real account data (no backend change).
  type Ev = { id: string; time: string; user: string; action: string; status: string };
  const events: Ev[] = [];
  for (const a of accounts) {
    const meta = PLATFORM_META[a.platform];
    events.push({
      id: `${a.id}-conn`,
      time: a.createdAt,
      user: a.connectedBy,
      action: `${meta.label} Connected`,
      status: "Success",
    });
    if (a.lastSyncAt && a.lastSyncAt !== a.createdAt) {
      events.push({
        id: `${a.id}-sync`,
        time: a.lastSyncAt,
        user: a.connectedBy,
        action: `${meta.label} Refreshed`,
        status: "Success",
      });
    }
  }
  events.sort((x, y) => new Date(y.time).getTime() - new Date(x.time).getTime());

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-2">
        <History className="h-4 w-4 text-sky-400" />
        <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
      </div>
      {events.length === 0 ? (
        <p className="text-xs text-white/40">No activity yet. Connect an account to see events here.</p>
      ) : (
        <ol className="relative space-y-4 border-l border-white/10 pl-4">
          {events.map((e, i) => (
            <motion.li
              key={e.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="relative"
            >
              <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-[#0c111d] bg-sky-400" />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-medium text-white/85">{e.action}</div>
                  <div className="text-[11px] text-white/45">
                    {e.user} · {new Date(e.time).toLocaleString()}
                  </div>
                </div>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  {e.status}
                </span>
              </div>
            </motion.li>
          ))}
        </ol>
      )}
    </div>
  );
}
