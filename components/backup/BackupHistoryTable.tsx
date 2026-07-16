"use client";

import { StatusBadge, statusTone, formatBytes } from "./primitives";
import { Download, ShieldCheck, RotateCcw, Trash2 } from "lucide-react";

export interface BackupRow {
  id: string; name: string; type: string; mode: string; status: string;
  startedAt?: string | null; completedAt?: string | null; durationMs?: number | null;
  sizeBytes?: number | null; compressionRatio?: number | null; checksum?: string | null;
  storageProvider: string; createdById?: string | null; verified: boolean; verifiedAt?: string | null;
}

export function BackupHistoryTable({ rows, onVerify, onRestore, onDelete }: {
  rows: BackupRow[]; onVerify: (id: string) => void; onRestore: (id: string) => void; onDelete: (id: string) => void;
}) {
  if (!rows.length) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-xs text-white/40">
          <tr className="border-b border-white/10">
            <th className="px-3 py-2">Name</th><th>Type</th><th>Mode</th><th>Status</th><th>Size</th><th>Compression</th><th>Checksum</th><th>Verified</th><th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.03]">
              <td className="px-3 py-2 font-medium text-white/80">{r.name}</td>
              <td className="text-white/60">{r.type}</td>
              <td className="text-white/60">{r.mode}</td>
              <td><StatusBadge tone={statusTone(r.status)}>{r.status}</StatusBadge></td>
              <td className="text-white/60">{formatBytes(r.sizeBytes)}</td>
              <td className="text-white/60">{r.compressionRatio ? `${r.compressionRatio.toFixed(2)}x` : "—"}</td>
              <td className="font-mono text-[10px] text-white/40">{r.checksum?.slice(0, 8) ?? "—"}</td>
              <td>{r.verified ? <ShieldCheck className="h-4 w-4 text-emerald-400" /> : <span className="text-white/30">—</span>}</td>
              <td className="py-2 text-right">
                <div className="flex justify-end gap-1">
                  <button onClick={() => onVerify(r.id)} title="Verify" className="rounded-md border border-white/10 p-1.5 text-sky-300 hover:bg-white/5"><ShieldCheck className="h-3.5 w-3.5" /></button>
                  <button onClick={() => onRestore(r.id)} title="Restore" className="rounded-md border border-white/10 p-1.5 text-emerald-300 hover:bg-white/5"><RotateCcw className="h-3.5 w-3.5" /></button>
                  <button onClick={() => onDelete(r.id)} title="Delete" className="rounded-md border border-white/10 p-1.5 text-rose-300 hover:bg-white/5"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
