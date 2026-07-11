"use client";

import { User, CalendarDays, Activity, MessagesSquare, Tag, UserCheck } from "lucide-react";
import type { CustomerProfileData } from "@/types/inbox";
import { PLATFORMS } from "./platformMeta";
import { fmtDate } from "./dateUtils";

export default function CustomerProfile({ profile }: { profile: CustomerProfileData | undefined }) {
  if (!profile) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-center text-xs text-white/50">
        Select a conversation to view customer details.
      </div>
    );
  }
  const meta = PLATFORMS[profile.platform];

  const rows: { icon: typeof User; label: string; value: string }[] = [
    { icon: User, label: "First Contact", value: fmtDate(profile.firstContact) },
    { icon: Activity, label: "Last Activity", value: fmtDate(profile.lastActivity) },
    { icon: MessagesSquare, label: "Conversations", value: profile.conversationCount.toString() },
    { icon: UserCheck, label: "Assigned Agent", value: profile.assignedAgent },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <User className="h-4 w-4 text-red-300" strokeWidth={1.8} />
        <h3 className="text-sm font-semibold text-white">Customer Profile</h3>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/8 text-base font-semibold text-white/85">
          {profile.name.replace(/^@/, "").slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white">{profile.name}</div>
          <div className={`text-xs ${meta.text}`}>{meta.label}</div>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {rows.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.label} className="flex items-center gap-2 text-xs">
              <Icon className="h-3.5 w-3.5 text-white/40" strokeWidth={1.8} />
              <span className="text-white/45">{r.label}</span>
              <span className="ml-auto truncate text-white/80">{r.value}</span>
            </div>
          );
        })}
      </div>

      {profile.tags.length > 0 && (
        <div className="mt-3 flex items-start gap-2 border-t border-white/10 pt-3">
          <Tag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40" strokeWidth={1.8} />
          <div className="flex flex-wrap gap-1.5">
            {profile.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/65"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
