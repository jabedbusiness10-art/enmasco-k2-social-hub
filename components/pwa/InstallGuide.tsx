"use client";

import { Monitor, Smartphone, Globe, Apple } from "lucide-react";

const steps = [
  { icon: Globe, title: "Chrome / Edge (Desktop)", text: "Open the menu (⋮) → “Install K2KAI Social Flow” → Confirm." },
  { icon: Smartphone, title: "Android (Chrome)", text: "Tap ⋮ → “Install app” → Add to Home screen." },
  { icon: Apple, title: "iOS / iPadOS (Safari)", text: "Tap Share → “Add to Home Screen”. Works in standalone mode." },
  { icon: Monitor, title: "Already installed?", text: "Launch from your Start menu / Home screen — it opens as a native app." },
];

export default function InstallGuide() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {steps.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 text-sm text-white/80"><Icon className="h-4 w-4 text-sky-300" /> {s.title}</div>
            <div className="mt-1 text-xs text-white/45">{s.text}</div>
          </div>
        );
      })}
    </div>
  );
}
