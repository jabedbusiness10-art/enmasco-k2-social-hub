"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { SecCard } from "@/components/security/primitives";
import { ActiveSessionsTable, type SessionRow } from "@/components/security/ActiveSessionsTable";
import { SecuritySkeleton } from "@/components/security/SecuritySkeleton";
import { terminateSessionAction, terminateOtherSessionsAction } from "@/lib/security/actions";

export default function SessionsPage() {
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/security/sessions", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setRows(j.sessions ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const terminate = async (id: string) => {
    setBusy(true);
    await terminateSessionAction(id);
    await load();
    setBusy(false);
  };
  const terminateOthers = async () => {
    setBusy(true);
    await terminateOtherSessionsAction();
    await load();
    setBusy(false);
  };

  return (
    <div>
      <PageHeader title="Active Sessions" description="Live login sessions across devices. Revoke any session that looks suspicious." />
      <SecCard className="p-4">
        {loading ? <SecuritySkeleton /> : <ActiveSessionsTable rows={rows} onTerminate={terminate} onTerminateOthers={terminateOthers} loading={busy} />}
      </SecCard>
    </div>
  );
}
