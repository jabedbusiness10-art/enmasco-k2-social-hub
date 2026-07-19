"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, X, Loader2, CheckCircle2 } from "lucide-react";
import ModalPortal from "@/components/ui/ModalPortal";

export default function DamUploadModal({ folders, onClose, onDone }: any) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<{ file: File; progress: number; status: "pending" | "uploading" | "done" | "error" }[]>([]);
  const [folderId, setFolderId] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list).map((f) => ({ file: f, progress: 0, status: "pending" as const }))]);
  }

  async function uploadAll() {
    setBusy(true);
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f.file));
    if (folderId) fd.append("folderId", folderId);
    const res = await fetch(`/api/media/upload`, { method: "POST", body: fd });
    if (res.ok) {
      setFiles(files.map((f) => ({ ...f, status: "done", progress: 100 })));
      setTimeout(() => onDone(), 600);
    } else {
      setFiles(files.map((f) => ({ ...f, status: "error" })));
    }
    setBusy(false);
  }

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0e0f17] p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-white">Upload Files</div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${dragging ? "border-sky-400/60 bg-sky-400/5" : "border-white/15 bg-white/[0.02]"}`}
        >
          <UploadCloud className="mb-2 h-9 w-9 text-sky-300" />
          <div className="text-sm text-white/80">Drag & drop or click to select</div>
          <div className="text-[11px] text-white/40">Multiple files supported</div>
          <input ref={inputRef} type="file" multiple hidden onChange={(e) => addFiles(e.target.files)} />
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-xs text-white/60">Folder</label>
          <select value={folderId} onChange={(e) => setFolderId(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 outline-none">
            <option value="">Root</option>
            {folders.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>

        {files.length > 0 && (
          <div className="mt-3 max-h-40 space-y-1.5 overflow-y-auto">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs">
                <span className="flex-1 truncate text-white/80">{f.file.name}</span>
                {f.status === "done" ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : f.status === "error" ? <span className="text-rose-400">error</span> : <span className="text-white/40">{formatBytes(f.file.size)}</span>}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/70">Cancel</button>
          <button onClick={uploadAll} disabled={!files.length || busy} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />} Upload {files.length > 0 && `(${files.length})`}
          </button>
        </div>
      </motion.div>
    </div>
    </ModalPortal>
  );
}

function formatBytes(n: number) {
  if (!n) return "0 B";
  const u = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(n) / Math.log(1024));
  return (n / Math.pow(1024, i)).toFixed(i ? 1 : 0) + " " + u[i];
}
