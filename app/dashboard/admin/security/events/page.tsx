"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { SecCard } from "@/components/security/primitives";
import { SecurityTimeline, type EventRow } from "@/components/security/SecurityTimeline";
import { SecurityFilters } from "@/components/security/SecurityFilters";
import { SecuritySkeleton } from "@/components/security/SecuritySkeleton";
import { resolveSecurityEvent } from "@/lib/security/actions";

export default function SecurityEventsPage() {
  const [rows, setRows] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState("ALL");
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (severity !== "ALL") qs.set("severity", severity);
    fetch(`/api/security/events?${qs.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setRows(j.rows ?? []))
      .finally(() => setLoading(false));
  };
  useEffect(load, [severity]);

  const resolve = async (id: string) => {
    await resolveSecurityEvent(id);
    await load();
  };

  const filtered = rows.filter((r) => !search || `${r.title} ${r.type}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Security Events" description="Correlated security signals ranked by severity (critical → low)." />
      <SecCard className="p-4">
        <SecurityFilters search={search} onSearch={setSearch} severity={severity} onSeverity={setSeverity} />
        <div className="mt-3">{loading ? <SecuritySkeleton /> : <SecurityTimeline rows={filtered} onResolve={resolve} />}</div>
      </SecCard>
    </div>
  );
}
