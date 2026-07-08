"use client";

import { motion } from "framer-motion";
import type { CustomerProfile } from "@/types/inbox";

type CustomerProfileProps = {
  profile: CustomerProfile;
};

export default function CustomerProfilePanel({ profile }: CustomerProfileProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Customer Details</div>
      <div className="mt-3 space-y-2 text-xs text-white/80">
        <div className="flex justify-between"><span className="text-white/60">Name</span><span className="text-white">{profile.name}</span></div>
        <div className="flex justify-between"><span className="text-white/60">Platform</span><span className="text-white">{profile.platform}</span></div>
        <div className="flex justify-between"><span className="text-white/60">First Contact</span><span className="text-white">{profile.firstContact}</span></div>
        <div className="flex justify-between"><span className="text-white/60">Last Activity</span><span className="text-white">{profile.lastActivity}</span></div>
        <div className="flex justify-between"><span className="text-white/60">Assigned Staff</span><span className="text-white">{profile.assignedStaff ?? "—"}</span></div>
        <div className="flex justify-between"><span className="text-white/60">Status</span><span className="text-white">{profile.status}</span></div>
        <div className="flex justify-between"><span className="text-white/60">Tags</span><span className="text-right text-white">{profile.tags.join(", ")}</span></div>
        <div>
          <div className="text-white/60">Notes</div>
          <div className="mt-1 text-white">{profile.notes}</div>
        </div>
        <div>
          <div className="text-white/60">History</div>
          <div className="mt-1 flex flex-col gap-1">
            {profile.interactionHistory.map((item) => (
              <div key={item.date} className="text-white">{item.date}: {item.action}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
