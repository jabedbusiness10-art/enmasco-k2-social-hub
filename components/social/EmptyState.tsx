"use client";

import { MessageSquare } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-white/60">
      <MessageSquare className="h-8 w-8 text-white/30" strokeWidth={1.8} />
      <div className="font-medium text-white">Select a platform to view content</div>
    </div>
  );
}
