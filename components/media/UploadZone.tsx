"use client";

import { useRef, useState } from "react";
import { UploadCloud, FileUp } from "lucide-react";

type UploadZoneProps = {
  canUpload: boolean;
  onUpload: (files: File[], category: string, tags: string) => Promise<void>;
  uploading: boolean;
  progress: number;
  fileProgress?: { name: string; pct: number } | null;
};

export default function UploadZone({ canUpload, onUpload, uploading, progress, fileProgress }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pending, setPending] = useState<File[]>([]);
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");

  if (!canUpload) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center text-sm text-white/50">
        You don&apos;t have permission to upload media.
      </div>
    );
  }

  function pickFiles(list: FileList | null) {
    if (!list) return;
    setPending(Array.from(list));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    pickFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
          dragOver
            ? "border-sky-400 bg-sky-500/10"
            : "border-white/15 bg-white/[0.03] hover:border-white/30"
        }`}
      >
        <UploadCloud className="h-10 w-10 text-sky-400/80" />
        <div className="mt-2 text-sm font-medium text-white">Drag &amp; drop files here</div>
        <div className="text-xs text-white/50">Images, Videos, PDFs — or click to browse</div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*,application/pdf"
          className="hidden"
          onChange={(e) => pickFiles(e.target.files)}
        />
      </div>

      {pending.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-2 text-xs text-white/70">
            {pending.length} file(s) selected:
            <span className="ml-1 text-white/50">{pending.map((f) => f.name).join(", ")}</span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category (optional)"
              className="h-9 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none placeholder:text-white/40"
            />
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tags (comma separated)"
              className="h-9 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none placeholder:text-white/40"
            />
          </div>
          {uploading && (
            <div className="mt-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-rose-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-white/50">
                <span className="truncate">{fileProgress ? `Uploading ${fileProgress.name}…` : "Uploading…"}</span>
                <span>{progress}%</span>
              </div>
            </div>
          )}
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => setPending([])}
              disabled={uploading}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white disabled:opacity-40"
            >
              Clear
            </button>
            <button
              onClick={() => onUpload(pending, category, tags)}
              disabled={uploading}
              className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-sky-500 to-rose-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              <FileUp className="h-3.5 w-3.5" /> Upload
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
