"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { SecCard } from "@/components/security/primitives";
import { LoginHistoryTable, type LoginRow } from "@/components/security/LoginHistoryTable";
import { SecurityFilters } from "@/components/security/SecurityFilters";
import { SecuritySkeleton } from "@/components/security/SecuritySkeleton";

export default function LoginHistoryPage() {
  const [rows, setRows] = useState<LoginRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/security/login-history", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setRows(j.rows ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rows.filter((r) => !search || `${r.email} ${r.result}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Login History" description="Successful, failed, expired and blocked authentication attempts." />
      <SecCard className="p-4">
        <SecurityFilters search={search} onSearch={setSearch} severity="ALL" onSeverity={() => {}} severities={["ALL"]} />
        <div className="mt-3">{loading ? <SecuritySkeleton /> : <LoginHistoryTable rows={filtered} />}</div>
      </SecCard>
    </div>
  );
}
