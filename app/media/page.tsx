"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ImageIcon } from "lucide-react";
import UploadZone from "@/components/media/UploadZone";
import MediaFilters from "@/components/media/MediaFilters";
import MediaGrid from "@/components/media/MediaGrid";
import MediaPreview from "@/components/media/MediaPreview";
import DeleteDialog from "@/components/media/DeleteDialog";
import type { MediaAsset, MediaFileType } from "@/types/media";

type Role = "CEO" | "ADMIN" | "MARKETING_MANAGER" | "MARKETING_TEAM" | "CONTENT_CREATOR" | "ANALYST" | "VIEWER";

const UPLOAD_ROLES: Role[] = ["CEO", "ADMIN", "MARKETING_MANAGER"];
const DELETE_ROLES: Role[] = ["CEO", "ADMIN"];

export default function MediaLibraryPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: Role } | undefined)?.role ?? "VIEWER";

  const canUpload = UPLOAD_ROLES.includes(role);
  const canDelete = DELETE_ROLES.includes(role);

  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [type, setType] = useState<MediaFileType | "">("");
  const [sort, setSort] = useState<"newest" | "oldest" | "name">("newest");

  const [preview, setPreview] = useState<MediaAsset | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (type) params.set("type", type);
      if (sort) params.set("sort", sort);
      const res = await fetch(`/api/media?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load");
      setAssets(json.assets ?? []);
      setError(null);
    } catch (e: any) {
      setError(e.message ?? "Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [search, type, sort]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function handleUpload(files: File[], category: string, tags: string) {
    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      for (let i = 0; i < files.length; i++) {
        const fd = new FormData();
        fd.append("files", files[i]);
        if (category) fd.append("category", category);
        if (tags) fd.append("tags", tags);
        const res = await fetch("/api/media/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Upload failed");
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      await load();
    } catch (e: any) {
      setError(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleCopy(url: string) {
    navigator.clipboard.writeText(url);
  }

  function handleDownload(asset: MediaAsset) {
    const a = document.createElement("a");
    a.href = asset.url;
    a.download = asset.originalName;
    a.click();
  }

  async function handleRename(id: string, name: string) {
    const res = await fetch(`/api/media/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalName: name }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Rename failed");
    setAssets((prev) => prev.map((a) => (a.id === id ? json.asset : a)));
    setPreview(json.asset);
  }

  async function handleDelete(asset: MediaAsset) {
    const res = await fetch(`/api/media/${asset.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Delete failed");
      setDeleteTarget(null);
      return;
    }
    setAssets((prev) => prev.filter((a) => a.id !== asset.id));
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5">
          <ImageIcon className="h-5 w-5 text-sky-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Company Media Library</h1>
          <p className="text-xs text-white/50">Store and manage all brand images, videos, and documents.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-300">
          {error}
        </div>
      )}

      <UploadZone canUpload={canUpload} onUpload={handleUpload} uploading={uploading} progress={progress} />

      <MediaFilters search={search} onSearch={setSearch} type={type} onType={setType} sort={sort} onSort={setSort} />

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : (
        <MediaGrid
          assets={assets}
          canDelete={canDelete}
          onCopy={handleCopy}
          onDelete={setDeleteTarget}
          onDownload={handleDownload}
          onPreview={setPreview}
        />
      )}

      <MediaPreview
        asset={preview}
        canDelete={canDelete}
        onClose={() => setPreview(null)}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onRename={handleRename}
        onToggleFavorite={() => {}}
      />
      <DeleteDialog asset={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
}
