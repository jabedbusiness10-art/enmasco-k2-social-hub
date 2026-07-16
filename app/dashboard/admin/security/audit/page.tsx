"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { SecCard } from "@/components/security/primitives";
import { AuditLogTable, type AuditRow } from "@/components/security/AuditLogTable";
import { SecurityFilters } from "@/components/security/SecurityFilters";
import { SecuritySkeleton } from "@/components/security/SecuritySkeleton";

export default function AuditLogPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (severity !== "ALL") qs.set("severity", severity);
    fetch(`/api/security/audit?${qs.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setRows(j.rows ?? []))
      .finally(() => setLoading(false));
  }, [severity]);

  const filtered = rows.filter((r) =>
    !search || `${r.action} ${r.module ?? ""} ${r.resource ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Audit Logs" description="Immutable record of security-relevant actions across the platform." />
      <SecCard className="p-4">
        <SecurityFilters search={search} onSearch={setSearch} severity={severity} onSeverity={setSeverity} />
        <div className="mt-3">{loading ? <SecuritySkeleton /> : <AuditLogTable rows={filtered} />}</div>
      </SecCard>
    </div>
  );
}
