"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Radio, RefreshCw, Bell, Bot, Film, Send, AlertTriangle, Globe, Layers, Image as ImageIcon, MessageCircle } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

interface Item {
  id: string;
  type: string;
  module: string;
  title: string;
  detail?: string;
  at: number;
  source: string;
}

const MODULE_ICON: Record<string, any> = {
  system: AlertTriangle,
  notification: Bell,
  queue: Layers,
  publishing: Send,
  media: Film,
  ai: Bot,
  facebook: Globe,
  instagram: ImageIcon,
  linkedin: MessageCircle,
};

function iconFor(item: Item) {
  return MODULE_ICON[item.source] || MODULE_ICON[item.module] || Radio;
}

export default function ActivityFeedPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/activity", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setItems(json.items ?? []);
      setLastSync(new Date().toLocaleTimeString());
    } catch {
      /* keep previous */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 15_000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Activity Feed"
        description="Unified enterprise timeline — every module's real activity in one stream."
        actions={
          <div className="flex items-center gap-3">
            {lastSync && <span className="text-xs text-white/40">Synced {lastSync}</span>}
            <button
              onClick={load}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        }
      />

      {loading && items.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="No activity yet" description="Events from publishing, AI, media, notifications and the queue will appear here in real time." />
      ) : (
        <div className="space-y-2">
          {items.map((it, i) => {
            const Icon = iconFor(it);
            return (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.3) }}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-sky-400">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-white">{it.title}</p>
                  {it.detail && <p className="truncate text-[11px] text-white/45">{it.detail}</p>}
                </div>
                <span className="shrink-0 text-[10px] text-white/35">{new Date(it.at).toLocaleString()}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
