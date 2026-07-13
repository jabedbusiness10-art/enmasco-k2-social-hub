"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import InfoBar from "@/components/layout/InfoBar";
import { LAYOUT_CLASSES } from "@/lib/layout-tokens";

/**
 * AppShell — the ONE global enterprise shell for every /dashboard/* route.
 * Architecture (Foundation v1.0):
 *   <AppShell>
 *     Sidebar          (fixed width, independent scroll)
 *     + (flex-1 column)
 *       TopBar         (global header, starts AFTER sidebar)
 *       InfoBar        (enterprise info ticker, framework only)
 *       Main Content   (independent scroll)
 *     Notification Layer
 *     Modal Layer
 *
 * Scroll strategy (PART 8):
 *   - Sidebar: independent (overflow-y-auto on its nav)
 *   - Main:    independent (overflow-y-auto on <main>)
 *   - Body:    no scroll (root h-[100dvh] overflow-hidden)
 * No double scrollbars, no nested scrolling.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#030305] text-white">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <InfoBar />
        <main className={`${LAYOUT_CLASSES.contentWrapper} flex-1 overflow-y-auto overflow-x-hidden`}>
          {children}
        </main>
      </div>
    </div>
  );
}
