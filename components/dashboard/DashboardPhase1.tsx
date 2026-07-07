"use client";

import React, { useState, useEffect } from "react";

export default function DashboardPhase1() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const socialCards = [
    { id: 1, platform: "Twitter", stats: "12.4k Followers", trend: "+14%" },
    { id: 2, platform: "LinkedIn", stats: "8.2k Connections", trend: "+5%" },
    { id: 3, platform: "Instagram", stats: "45.1k Followers", trend: "+22%" },
    { id: 4, platform: "Facebook", stats: "102k Likes", trend: "-2%" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-8 font-sans selection:bg-blue-500/30">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105">
              <span className="text-xl font-bold text-white tracking-tighter">K2</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
              SOCIAL
            </h1>
          </div>

          <div className="hidden sm:block h-8 w-px bg-white/10"></div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm shadow-inner">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-medium text-emerald-300">
              Live
            </span>
            <span className="text-xs font-mono text-neutral-300">
              {formattedTime}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Last synced
            </p>
            <p className="text-xs text-neutral-300">Just now</p>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {socialCards.map((card) => (
          <div
            key={card.id}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  {card.platform}
                </p>
                <p className="text-2xl font-semibold text-white mt-1">
                  {card.stats}
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                  card.trend.startsWith("+")
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-red-500/10 text-red-300"
                }`}
              >
                {card.trend}
              </span>
            </div>

            <div className="h-10 w-full rounded-xl bg-white/[0.03] border border-white/10"></div>
          </div>
        ))}
      </section>

      <section className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Engagement
              </p>
              <p className="text-sm text-neutral-300">
                Overview across all channels
              </p>
            </div>
          </div>
          <div className="h-48 w-full rounded-xl bg-white/[0.03] border border-white/10"></div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Top Posts
              </p>
              <p className="text-sm text-neutral-300">Today</p>
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-10 w-full rounded-lg bg-white/[0.03] border border-white/10"
              ></div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
