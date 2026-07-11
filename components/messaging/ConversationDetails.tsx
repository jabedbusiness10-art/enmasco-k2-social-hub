"use client";

import type { Channel } from "@/types/message";

type ConversationDetailsProps = {
  channel: Channel;
};

export default function ConversationDetails({ channel }: ConversationDetailsProps) {
  return (
    <div className="space-y-4 p-4 text-sm text-white/80">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Channel Information</div>
        <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="font-medium text-white">{channel.name}</div>
          <div className="mt-1 text-xs text-white/60">{channel.type === "PUBLIC" ? "Public channel" : "Private channel"}</div>
        </div>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Members</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {["MD Kazim", "Lipton", "Arif", "Sumon", "MD Kazim"].map((name) => (
            <span key={name} className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 text-xs text-white/80">
              {name}
            </span>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Pinned Messages</div>
        <div className="mt-2 rounded-xl border border-dashed border-white/10 px-3 py-2 text-xs text-white/60">Placeholder</div>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Shared Files</div>
        <div className="mt-2 rounded-xl border border-dashed border-white/10 px-3 py-2 text-xs text-white/60">Placeholder</div>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Recent Activity</div>
        <div className="mt-2 rounded-xl border border-dashed border-white/10 px-3 py-2 text-xs text-white/60">Placeholder</div>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Media Gallery</div>
        <div className="mt-2 rounded-xl border border-dashed border-white/10 px-3 py-2 text-xs text-white/60">Placeholder</div>
      </div>
    </div>
  );
}
