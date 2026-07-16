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
            <main className={`${LAYOUT_CLASSES.contentWrapper} min-h-0 flex-1 overflow-y-auto overflow-x-hidden`}>
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
