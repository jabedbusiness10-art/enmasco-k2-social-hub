"use client";

import { Activity, CheckCircle2, CircleSlash2, Database, Info, Server, Workflow } from "lucide-react";

interface QueueHealthState {
  available?: boolean;
  configured?: boolean;
  redisConnected?: boolean;
  engine?: string;
}

export default function QueueHealth({ health }: { health: QueueHealthState | null }) {
  const configured = Boolean(health?.configured);
  const connected = Boolean(health?.redisConnected);
  const bullmqActive = Boolean(health?.available && connected && health?.engine === "bullmq");
  const isDevelopment = process.env.NODE_ENV !== "production";

  const pills = bullmqActive
    ? [
        { label: "Redis Connected", tone: "success" as const },
        { label: "BullMQ Active", tone: "success" as const },
        { label: "Live Queue Metrics", tone: "success" as const },
      ]
    : [
        { label: isDevelopment ? "Development Mode" : "Production Mode", tone: "info" as const },
        { label: "Database Queue Active", tone: "success" as const },
        { label: configured ? "Redis Offline" : "Redis Optional", tone: "neutral" as const },
      ];

  const cards = [
    {
      label: "Current Engine",
      value: bullmqActive ? "BullMQ" : "Database Queue",
      detail: bullmqActive ? "Background processing active" : "Built-in fallback active",
      icon: Database,
      tone: "text-emerald-300",
    },
    {
      label: "Redis",
      value: connected ? "Connected" : configured ? "Offline" : "Not Configured",
      detail: connected ? "Managed connection healthy" : configured ? "Connection unavailable" : "Optional for local development",
      icon: Server,
      tone: connected ? "text-emerald-300" : "text-sky-300",
      offline: !connected,
    },
    {
      label: "BullMQ",
      value: bullmqActive ? "Active" : configured ? "Configured but Inactive" : "Available but Disabled",
      detail: bullmqActive ? "Live queue engine" : "Activates automatically with Redis",
      icon: Workflow,
      tone: bullmqActive ? "text-emerald-300" : "text-violet-300",
    },
    {
      label: "Environment",
      value: isDevelopment ? "Development" : "Production",
      detail: isDevelopment ? "Fallback is expected" : connected ? "Redis-backed processing" : "Redis requires attention",
      icon: Activity,
      tone: "text-sky-300",
    },
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
        <Info className="h-4 w-4 text-sky-300" /> Queue Runtime Status
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {pills.map((pill) => <StatusPill key={pill.label} label={pill.label} tone={pill.tone} />)}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-xl border border-white/[0.08] bg-black/20 p-3.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/40">{card.label}</span>
                <Icon className={`h-4 w-4 ${card.tone}`} />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{card.value}</span>
                {card.offline && (
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[8px] font-semibold tracking-[0.12em] text-white/45">
                    OFFLINE
                  </span>
                )}
              </div>
              <p className="mt-1 text-[10px] leading-relaxed text-white/40">{card.detail}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StatusPill({ label, tone }: { label: string; tone: "success" | "info" | "neutral" }) {
  const styles = {
    success: "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-200",
    info: "border-sky-400/25 bg-sky-400/[0.08] text-sky-200",
    neutral: "border-white/10 bg-white/[0.045] text-white/65",
  };
  const Icon = tone === "success" ? CheckCircle2 : tone === "info" ? Info : CircleSlash2;

  return (
    <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${styles[tone]}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
