"use client";

import { motion } from "framer-motion";
import { Inbox, Mail, UserCheck, Star, Archive, ShieldAlert } from "lucide-react";
import type { InboxFolder } from "@/types/inbox";

const FOLDERS: { key: InboxFolder; label: string; icon: typeof Inbox }[] = [
  { key: "ALL", label: "All Inbox", icon: Inbox },
  { key: "UNREAD", label: "Unread", icon: Mail },
  { key: "ASSIGNED", label: "Assigned", icon: UserCheck },
  { key: "STARRED", label: "Starred", icon: Star },
  { key: "ARCHIVED", label: "Archived", icon: Archive },
  { key: "SPAM", label: "Spam", icon: ShieldAlert },
];

type Props = {
  active: InboxFolder;
  onSelect: (f: InboxFolder) => void;
  counts?: Partial<Record<InboxFolder, number>>;
};

export default function InboxSidebar({ active, onSelect, counts }: Props) {
  return (
    <nav className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-2 backdrop-blur-xl">
      {FOLDERS.map((f) => {
        const Icon = f.icon;
        const isActive = active === f.key;
        const count = counts?.[f.key];
        return (
          <button
            key={f.key}
            onClick={() => onSelect(f.key)}
            className={`group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition ${
              isActive
                ? "bg-red-500/15 text-white shadow-[0_0_24px_rgba(248,113,113,0.18)]"
                : "text-white/65 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon
              className={`h-4 w-4 ${isActive ? "text-red-300" : "text-white/45"}`}
              strokeWidth={1.8}
            />
            <span className="flex-1 text-left font-medium">{f.label}</span>
            {count ? (
              <span className="rounded-full bg-white/10 px-1.5 text-[10px] text-white/70">
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
