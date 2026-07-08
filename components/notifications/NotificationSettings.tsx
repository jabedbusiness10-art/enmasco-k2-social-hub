"use client";

import { motion } from "framer-motion";
import type { NotificationSetting } from "@/types/notification";

type NotificationSettingsProps = {
  settings: NotificationSetting[];
};

export default function NotificationSettings({ settings }: NotificationSettingsProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Notification Settings</div>
      <div className="mt-3 space-y-2">
        {settings.map((setting, index) => (
          <div key={setting.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/80">
            <div>{setting.label}</div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${setting.enabled ? "border-emerald-500/40 text-emerald-200" : "border-white/10 text-white/70"}`}
            >
              {setting.enabled ? "ON" : "OFF"}
            </motion.button>
          </div>
        ))}
      </div>
    </div>
  );
}
