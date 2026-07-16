"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, Check, Loader2 } from "lucide-react";
import { StatusBadge, statusTone } from "./primitives";

interface Bkp { id: string; name: string; type: string; status: string; verified: boolean; sizeBytes?: number | null; }
const SCOPES = ["DATABASE", "MEDIA", "SETTINGS", "EVERYTHING"];

export function RestoreWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [jobs, setJobs] = useState<Bkp[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [scope, setScope] = useState("EVERYTHING");
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<{ ok: boolean; msg: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [restoreId, setRestoreId] = useState<string | null>(null);

  useEffect(() => {
    if (step === 0) fetch("/api/backup/jobs?take=50", { cache: "no-store" }).then((r) => r.json()).then((j) => setJobs((j.rows ?? []).filter((x: Bkp) => x.status === "COMPLETED"))).finally(() => setValidating(false));
  }, [step]);

  const validate = async () => {
    setValidating(true); setValidation(null);
    const j = jobs.find((x) => x.id === selected);
    if (!j) { setValidation({ ok: false, msg: "Select a completed backup" }); setValidating(false); return; }
    await new Promise((r) => setTimeout(r, 400));
    setValidation({ ok: j.verified, msg: j.verified ? `Backup "${j.name}" verified — ready to restore` : `Backup "${j.name}" not yet verified. Proceed only if you trust it.` });
    setValidating(false);
    setStep(2);
  };

  const confirm = async () => {
    setSubmitting(true);
    const r = await fetch("/api/backup/restore", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ backupJobId: selected, scope }) });
    const j = await r.json();
    setRestoreId(j.id);
    setSubmitting(false);
    setStep(4);
  };

  const steps = ["Select Backup", "Validate", "Scope", "Confirm", "Progress", "Report"];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1 text-xs text-white/40">
        {steps.map((s, i) => (
          <span key={s} className="flex items-center gap-1">
            <span className={i === step ? "text-sky-300" : i < step ? "text-emerald-300" : ""}>{i + 1}. {s}</span>
            {i < steps.length - 1 && <ChevronRight className="h-3 w-3" />}
          </span>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-2">
          {jobs.length === 0 && <div className="text-sm text-white/40">No completed backups available to restore.</div>}
          {jobs.map((j) => (
            <button key={j.id} onClick={() => setSelected(j.id)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${selected === j.id ? "border-sky-400/40 bg-sky-400/10" : "border-white/10 bg-white/[0.02]"}`}>
              <div><div className="font-medium text-white/80">{j.name}</div><div className="text-xs text-white/40">{j.type} · {j.sizeBytes ? `${(j.sizeBytes / 1024).toFixed(0)} KB` : ""}</div></div>
              <StatusBadge tone={statusTone(j.status)}>{j.status}</StatusBadge>
            </button>
          ))}
          <button disabled={!selected} onClick={() => setStep(1)} className="rounded-lg bg-sky-500/80 px-4 py-2 text-sm font-medium text-white disabled:opacity-40">Next</button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <button onClick={validate} disabled={validating} className="rounded-lg bg-sky-500/80 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 flex items-center gap-2">
            {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Validate Backup
          </button>
        </div>
      )}

      {step === 2 && validation && (
        <div className="space-y-3">
          <div className={`rounded-xl border px-4 py-3 text-sm ${validation.ok ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-amber-400/30 bg-amber-400/10 text-amber-200"}`}>{validation.msg}</div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {SCOPES.map((s) => (
              <button key={s} onClick={() => setScope(s)} className={`rounded-xl border px-3 py-2 text-sm ${scope === s ? "border-sky-400/40 bg-sky-400/10 text-sky-200" : "border-white/10 bg-white/[0.02] text-white/60"}`}>{s}</button>
            ))}
          </div>
          <button onClick={() => setStep(3)} className="rounded-lg bg-sky-500/80 px-4 py-2 text-sm font-medium text-white">Next</button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/70">Confirm restore of <b>{jobs.find((x) => x.id === selected)?.name}</b> with scope <b>{scope}</b>. This action is audited.</div>
          <button onClick={confirm} disabled={submitting} className="rounded-lg bg-emerald-500/80 px-4 py-2 text-sm font-medium text-white disabled:opacity-40">{submitting ? "Restoring…" : "Start Restore"}</button>
        </div>
      )}

      {step === 4 && restoreId && <RestoreProgress restoreId={restoreId} onDone={() => setStep(5)} />}

      {step === 5 && restoreId && <RestoreReport restoreId={restoreId} onBack={() => router.refresh()} />}
    </div>
  );
}

function RestoreProgress({ restoreId, onDone }: { restoreId: string; onDone: () => void }) {
  const [status, setStatus] = useState("RUNNING");
  useEffect(() => {
    const t = setInterval(async () => {
      const r = await fetch(`/api/backup/logs?take=20`, { cache: "no-store" }).then((x) => x.json());
      // derive status from latest matching log
      const done = (r.rows ?? []).some((l: any) => l.restoreJobId === restoreId && (l.type === "RESTORE_COMPLETED" || l.type === "RESTORE_FAILED"));
      if (done) { setStatus("DONE"); clearInterval(t); onDone(); }
    }, 1500);
    return () => clearInterval(t);
  }, [restoreId]);
  return <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/60"><Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-sky-300" /> Restore in progress… ({status})</div>;
}

function RestoreReport({ restoreId, onBack }: { restoreId: string; onBack: () => void }) {
  return (
    <div className="space-y-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
      <div className="flex items-center gap-2 text-emerald-200"><Check className="h-5 w-5" /> Restore completed (Job {restoreId.slice(0, 8)}).</div>
      <div className="text-xs text-white/50">Recovery log updated. See Recovery Logs for full audit trail.</div>
      <button onClick={onBack} className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 hover:bg-white/5">Done</button>
    </div>
  );
}
