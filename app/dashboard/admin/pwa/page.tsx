"use client";

import PageHeader from "@/components/layout/PageHeader";
import { BackupCard } from "@/components/backup/primitives";
import PWASettings from "@/components/pwa/PWASettings";
import CacheManager from "@/components/pwa/CacheManager";
import VersionCard from "@/components/pwa/VersionCard";
import SyncStatus from "@/components/pwa/SyncStatus";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import InstallGuide from "@/components/pwa/InstallGuide";
import ConnectionStatus from "@/components/pwa/ConnectionStatus";
import { usePWA } from "@/components/pwa/PWAProvider";

export default function PWASettingsPage() {
  const { swActive, updateAvailable } = usePWA();
  return (
    <div>
      <PageHeader title="PWA Settings" description="Install status, service worker, cache, version and background sync for the K2KAI Social Flow app." />
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <VersionCard version="1.0.0" swActive={swActive} updateAvailable={updateAvailable} />
          <ConnectionStatusWrapper />
        </div>
        <BackupCard className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm text-white/70">Installation</div>
            <InstallPrompt />
          </div>
          <PWASettings />
        </BackupCard>
        <CacheManager />
        <SyncStatus />
        <BackupCard className="p-4">
          <div className="mb-3 text-sm text-white/70">How to install</div>
          <InstallGuide />
        </BackupCard>
      </div>
    </div>
  );
}

function ConnectionStatusWrapper() {
  return (
    <BackupCard className="p-4">
      <div className="mb-3 text-sm text-white/70">Connection</div>
      <ConnectionStatus />
    </BackupCard>
  );
}
