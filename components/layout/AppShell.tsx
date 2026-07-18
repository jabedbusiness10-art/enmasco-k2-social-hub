"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import InfoBar from "@/components/layout/InfoBar";
import CommandPalette from "@/components/search/CommandPalette";
import { LAYOUT_CLASSES } from "@/lib/layout-tokens";
import { PWAProvider } from "@/components/pwa/PWAProvider";
import InstallBanner from "@/components/pwa/InstallBanner";
import OfflineBanner from "@/components/pwa/OfflineBanner";
import UpdateAvailable from "@/components/pwa/UpdateAvailable";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";

/**
 * AppShell — the ONE global enterprise shell for every /dashboard/* route.
 * Sidebar (fixed) + TopBar + InfoBar + Main, plus the global
 * Command Palette (CTRL/CMD+K) mounted once for the whole app.
 *
 * Scroll ownership: `main` is the single native scroll container for all
 * dashboard content. The sidebar keeps its own independent scroll. The root
 * shell is `overflow-hidden` so the browser <body> never scrolls. `main`
 * uses min-h-0 + overflow-y-auto + overscroll-behavior:contain +
 * scrollbar-gutter:stable so the wheel/trackpad works from ANY point on the
 * page (hero, cards, empty space) with no nested-scroll conflict.
 * No framer-motion layoutScroll on `main` — that projection-scroll hook
 * hijacked wheel delivery over the animated hero; viewport IntersectionObserver
 * still drives whileInView reveals as content scrolls into view.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <PWAProvider>
      <LocaleProvider>
        <div className="flex h-[100dvh] w-full overflow-hidden bg-[#030305] text-white">
          <Sidebar />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <TopBar />
            <InfoBar />
            <main
              className={`${LAYOUT_CLASSES.contentWrapper} min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth`}
              style={{ scrollbarGutter: "stable", overscrollBehavior: "contain" }}
            >
              {children}
            </main>
          </div>
          <CommandPalette />
        </div>
        <InstallBanner />
        <OfflineBanner />
        <UpdateAvailable />
      </LocaleProvider>
    </PWAProvider>
  );
}
