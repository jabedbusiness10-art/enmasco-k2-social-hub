"use client";

import { Laptop } from "lucide-react";
import { StatusBadge } from "./primitives";

export interface Device {
  id: string; name?: string | null; browser?: string | null; os?: string | null; ip?: string | null; lastUsedAt?: string | Date | null;
}

export function DeviceCard({ device }: { device: Device }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <Laptop className="h-5 w-5 text-sky-300" />
      <div className="flex-1">
        <div className="text-sm text-white/85">{device.name ?? `${device.browser ?? "Unknown"} ${device.os ?? ""}`}</div>
        <div className="text-[11px] text-white/40">{device.ip ?? "—"} · {device.lastUsedAt ? new Date(device.lastUsedAt).toLocaleString() : "—"}</div>
      </div>
      <StatusBadge tone="green">trusted</StatusBadge>
    </div>
  );
}
