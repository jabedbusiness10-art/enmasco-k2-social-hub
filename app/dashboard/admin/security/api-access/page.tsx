"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { SecCard } from "@/components/security/primitives";
import { ApiAccessTable, type ApiRow } from "@/components/security/ApiAccessTable";
import { SecurityFilters } from "@/components/security/SecurityFilters";
import { SecuritySkeleton } from "@/components/security/SecuritySkeleton";

export default function ApiAccessPage() {
  const [rows, setRows] = useState<ApiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/security/api-access", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setRows(j.rows ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rows.filter((r) => !search || `${r.endpoint} ${r.method}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="API Access" description="Every authenticated API call is logged with endpoint, status and latency." />
      <SecCard className="p-4">
        <SecurityFilters search={search} onSearch={setSearch} severity="ALL" onSeverity={() => {}} severities={["ALL"]} />
        <div className="mt-3">{loading ? <SecuritySkeleton /> : <ApiAccessTable rows={filtered} />}</div>
      </SecCard>
    </div>
  );
}
