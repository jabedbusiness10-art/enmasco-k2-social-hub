"use client";

import { useEffect, useState, useCallback } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Container } from "@/components/layout/Container";
import NotificationFilters from "@/components/notifications/NotificationFilters";
import NotificationCard from "@/components/notifications/NotificationCard";
import EmptyState from "@/components/notifications/EmptyState";
import LoadingSkeleton from "@/components/notifications/LoadingSkeleton";
import NotificationTimeline from "@/components/notifications/NotificationTimeline";
import NotificationPreferences from "@/components/notifications/NotificationPreferences";
import EnterpriseIntelligence from "@/components/notifications/EnterpriseIntelligence";
import { CheckCheck, Archive, Trash2, Bell, Activity, SlidersHorizontal, Globe } from "lucide-react";
import type { Notification } from "@/types/notification";

const SECTIONS = [
  { key: "ALL", label: "All" },
  { key: "UNREAD", label: "Unread" },
  { key: "MENTIONS", label: "Mentions", category: "MENTIONS" },
  { key: "MESSAGES", label: "Messages", category: "MESSAGES" },
  { key: "PUBLISHING", label: "Publishing", category: "PUBLISHING" },
  { key: "AI", label: "AI", category: "AI" },
  { key: "MEDIA", label: "Media", category: "MEDIA" },
  { key: "ASSIGNMENTS", label: "Assignments", category: "ASSIGNMENTS" },
  { key: "ANALYTICS", label: "Analytics", category: "ANALYTICS" },
  { key: "SECURITY", label: "Security", category: "SECURITY" },
  { key: "SYSTEM", label: "System", category: "SYSTEM" },
  { key: "ARCHIVED", label: "Archived" },
];

const TABS = [
  { key: "feed", label: "Notifications", icon: Bell },
  { key: "timeline", label: "Timeline", icon: Activity },
  { key: "preferences", label: "Preferences", icon: SlidersHorizontal },
  { key: "intelligence", label: "Enterprise Intelligence", icon: Globe },
];

export default function NotificationCenterPage() {
  const [tab, setTab] = useState("feed");
  const [section, setSection] = useState("ALL");
  const [items, setItems] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [filters, setFilters] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const TAKE = 30;

  const activeSection = SECTIONS.find((s) => s.key === section)!;

  const load = useCallback(async (reset = true) => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (activeSection.category) qs.set("category", activeSection.category);
    if (section === "UNREAD") qs.set("unread", "1");
    if (section === "ARCHIVED") qs.set("archived", "1");
    if (filters.priority) qs.set("priority", filters.priority);
    if (filters.module) qs.set("module", filters.module);
    if (filters.platform) qs.set("platform", filters.platform);
    if (filters.unread) qs.set("unread", "1");
    if (filters.search) qs.set("search", filters.search);
    qs.set("take", String(TAKE));
    qs.set("skip", String(reset ? 0 : skip));
    const r = await fetch(`/api/notifications?${qs}`);
    const j = await r.json();
    setItems(reset ? (j.items ?? []) : [...items, ...(j.items ?? [])]);
    setTotal(j.total ?? 0);
    setUnread(j.unread ?? 0);
    setLoading(false);
  }, [activeSection, section, filters, skip, items]);

  useEffect(() => { load(true); }, [activeSection, section, filters]);

  const markRead = async (id: string) => {
    setItems((p) => p.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
    await fetch("/api/notifications/read", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
  };

  const markAll = async () => {
    setItems((p) => p.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
    await fetch("/api/notifications/read-all", { method: "POST" });
  };

  const archive = async (id: string) => {
    setItems((p) => p.filter((n) => n.id !== id));
    await fetch("/api/notifications/archive", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
  };

  const remove = async (id: string) => {
    setItems((p) => p.filter((n) => n.id !== id));
    await fetch(`/api/notifications/delete?id=${id}`, { method: "DELETE" });
  };

  const loadMore = () => {
    if (items.length < total) { setSkip((s) => s + TAKE); load(false); }
  };

  return (
    <>
      <PageHeader
        title="Notification Center"
        description="One centralized engine for every enterprise event across Social, Publishing, AI, Media, Team, Analytics and System."
        actions={
          <button onClick={markAll} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10">
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </button>
        }
      />
      <Container size="full">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${tab === t.key ? "border-sky-400/40 bg-sky-400/10 text-sky-200" : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/10"}`}>
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "feed" && (
          <>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {SECTIONS.map((s) => (
                <button key={s.key} onClick={() => setSection(s.key)} className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${section === s.key ? "border-sky-400/40 bg-sky-400/10 text-sky-200" : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/10"}`}>
                  {s.label}
                  {s.key === "UNREAD" && unread > 0 && <span className="ml-1.5 rounded-full bg-red-500 px-1.5 text-[10px] text-white">{unread}</span>}
                </button>
              ))}
            </div>
            <NotificationFilters filters={filters} setFilters={setFilters} />
            <div className="mt-4">
              {loading ? <LoadingSkeleton /> : items.length === 0 ? (
                <EmptyState title="No notifications" hint="Events from every module will appear here in real time." />
              ) : (
                <div className="space-y-2">
                  {items.map((n) => (
                    <NotificationCard key={n.id} notification={n} onRead={markRead} onArchive={archive} />
                  ))}
                  {items.length < total && (
                    <button onClick={loadMore} className="w-full rounded-xl border border-white/10 py-2 text-xs text-white/60 hover:bg-white/5">Load more</button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {tab === "timeline" && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-3 text-sm font-semibold text-white">Live Event Timeline</div>
            <NotificationTimeline />
          </div>
        )}

        {tab === "preferences" && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-3 text-sm font-semibold text-white">Notification Preferences</div>
            <NotificationPreferences />
          </div>
        )}

        {tab === "intelligence" && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <EnterpriseIntelligence />
          </div>
        )}
      </Container>
    </>
  );
}
