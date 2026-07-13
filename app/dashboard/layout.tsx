import AppShell from "@/components/layout/AppShell";

/**
 * DashboardLayout — single global AppShell for every /dashboard/* route.
 * No page may create its own sidebar or header; all inherit this shell.
 * (Foundation v1.0 — layout architecture only, no visual redesign.)
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
