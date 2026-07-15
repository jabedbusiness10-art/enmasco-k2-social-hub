"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Settings } from "lucide-react";
import NotificationDrawer from "./NotificationDrawer";

export default function NotificationBell() {
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const load = async () => {
    try {
      const r = await fetch("/api/notifications?take=1");
      const j = await r.json();
      setUnread(j.unread ?? 0);
    } catch {}
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000); // real-time polling
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] text-white/76 shadow-[0_14px_34px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-300 hover:border-red-200/35 hover:bg-red-400/[0.09] hover:text-white hover:shadow-[0_0_30px_rgba(248,113,113,0.24)] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200/60"
        aria-label={`Notifications: ${unread} unread`}
      >
        <Bell className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-6" strokeWidth={1.8} />
        {unread > 0 && (
          <span className="absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full border border-red-100/30 bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-[0_0_18px_rgba(239,68,68,0.65)]">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <NotificationDrawer
          onClose={() => setOpen(false)}
          onViewAll={() => { setOpen(false); router.push("/dashboard/notifications"); }}
          onChanged={load}
        />
      )}
    </>
  );
}
