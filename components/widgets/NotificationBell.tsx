"use client";

import { useState, useEffect } from "react";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);

  const notifications = [
    "New Duty Assigned",
    "CEO Logged In",
    "AI Task Completed",
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] p-2 text-neutral-300 transition hover:text-white"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
        <span className="absolute -top-1 -right-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
          5
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/10 bg-black/80 p-3 shadow-2xl backdrop-blur-xl">
          <ul className="space-y-2">
            {notifications.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-white/5 bg-white/[0.04] px-3 py-2 text-xs text-neutral-200"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
