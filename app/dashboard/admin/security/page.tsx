"use client";

import { motion } from "framer-motion";
import { User, Bell, KeyRound, ShieldCheck } from "lucide-react";

const sections = [
  { icon: User, title: "Profile", desc: "Your personal account details & display name" },
  { icon: Bell, title: "Notifications", desc: "Email & in-app alert preferences" },
  { icon: KeyRound, title: "Security", desc: "Password & two-factor authentication" },
  { icon: ShieldCheck, title: "Sessions", desc: "Active login sessions & devices" },
];

export default function AccountSettingsPage() {
  return (
    <div className="flex h-full flex-col">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3"
      >
        <div>
          <h1 className="text-xl font-semibold text-white">Account Settings</h1>
          <p className="text-xs text-white/45">Manage your personal account, security & notifications</p>
        </div>
      </motion.div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {sections.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.button
              key={s.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left hover:border-sky-400/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
                <Icon className="h-5 w-5 text-sky-300" strokeWidth={1.8} />
              </span>
              <div>
                <div className="text-sm font-semibold text-white">{s.title}</div>
                <div className="text-xs text-white/50">{s.desc}</div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
