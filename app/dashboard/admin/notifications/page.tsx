"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import NotificationHeader from "@/components/notifications/NotificationHeader";
import NotificationStats from "@/components/notifications/NotificationStats";
import NotificationList from "@/components/notifications/NotificationList";
import NotificationDetails from "@/components/notifications/NotificationDetails";
import ActivityFeed from "@/components/notifications/ActivityFeed";
import NotificationFilters from "@/components/notifications/NotificationFilters";
import NotificationSettings from "@/components/notifications/NotificationSettings";
import { notifications, activities, notificationSettings } from "@/data/notification";
import type { Notification } from "@/types/notification";

const tabs = ["All", "Unread", "Mentions", "Approvals", "Automation", "System"] as const;
type Tab = (typeof tabs)[number];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [settingsView, setSettingsView] = useState(false);

  const selectedNotification = notifications.find((n) => n.id === selectedId) ?? null;

  const filtered = notifications.filter((notification) => {
    const t = notification.type as string;
    if (activeTab === "All") return true;
    if (activeTab === "Unread") return !notification.read;
    if (activeTab === "Mentions") return t === "MESSAGE";
    if (activeTab === "Approvals") return t === "APPROVAL";
    if (activeTab === "Automation") return t === "AUTOMATION" || t === "WORKFLOW";
    if (activeTab === "System") return t === "SYSTEM" || t === "SECURITY";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-full flex-col">
      <NotificationHeader filters={tabs} activeFilter={activeTab} onSelectFilter={setActiveTab as (filter: string) => void} />
      <NotificationStats />

      <div className="mt-4 grid flex-1 grid-cols-1 overflow-hidden xl:grid-cols-[16rem_1fr_16rem]">
        <aside className="flex h-full flex-col gap-3 overflow-hidden p-4">
          <NotificationFilters filters={Array.from(tabs)} active={activeTab} onSelect={setActiveTab as (value: string) => void} />
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/80">
            <div className="font-semibold text-white">Quick Actions</div>
            <div className="mt-2 space-y-2">
              <button onClick={() => setSettingsView(false)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs hover:bg-white/10">View All Notifications</button>
              <button onClick={() => setSettingsView(true)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs hover:bg-white/10">Notification Settings</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {settingsView ? (
              <NotificationSettings settings={notificationSettings} />
            ) : (
              <>
                <div className="text-xs text-white/60">{unreadCount} unread</div>
                <div className="mt-2">
                  <NotificationList notifications={filtered} onOpen={setSelectedId} />
                </div>
              </>
            )}
          </div>
        </aside>

        <div className="flex h-full flex-col gap-3 overflow-y-auto border-r border-white/5 p-4">
          {settingsView ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs text-white/80">
              <div className="text-sm font-semibold text-white">Notification Settings</div>
              <div className="mt-2 space-y-2">
                {notificationSettings.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                    <div>{item.label}</div>
                    <motion.button whileTap={{ scale: 0.97 }} className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${item.enabled ? "border-emerald-500/40 text-emerald-200" : "border-white/10 text-white/70"}`}>
                      {item.enabled ? "ON" : "OFF"}
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <NotificationDetails notification={selectedNotification} />
          )}
          <ActivityFeed activities={activities} />
        </div>

        <div className="hidden lg:flex flex-col gap-3 overflow-y-auto p-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Notification Summary</div>
            <div className="mt-3 space-y-2 text-xs text-white/80">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">Total: {notifications.length}</div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">Unread: {unreadCount}</div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">High Priority: {notifications.filter((n) => n.priority === "HIGH").length}</div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">AI Events: {notifications.filter((n) => n.type === "AI").length}</div>
              <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-3 text-white/60">Future: WebSocket ready architecture.</div>
            </div>
          </div>
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
}
