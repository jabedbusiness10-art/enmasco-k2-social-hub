import AppShell from "@/components/layout/AppShell";

/**
 * Monitoring lives outside /dashboard for backwards-compatible bookmarks,
 * but it is still part of the System module and must retain the global shell.
 */
export default function MonitoringLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
