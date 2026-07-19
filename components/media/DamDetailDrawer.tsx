"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Star, Pencil, FolderInput, Copy, Download, Share2, Archive, Trash2, RotateCcw, Sparkles, Image as ImageIcon, Video, FileText, Tag as TagIcon, CalendarClock, Layers, Radio } from "lucide-react";
import { formatBytes } from "./DamAssetCard";
import ModalPortal from "@/components/ui/ModalPortal";

const TYPE_ICON: Record<string, any> = { IMAGE: ImageIcon, VIDEO: Video, DOCUMENT: FileText, LOGO: ImageIcon, BRAND_ASSET: ImageIcon };
const PLATFORMS = ["facebook", "instagram", "linkedin", "youtube", "x"];

export default function DamDetailDrawer({ asset, folders, onClose, onChanged }: any) {
  const [editName, setEditName] = useState(asset.originalName);
  const [editDesc, setEditDesc] = useState(asset.description || "");
  const [editTags, setEditTags] = useState((asset.tags || []).join(", "));
  const [platforms, setPlatforms] = useState<string[]>(asset.platforms || []);
  const [campaign, setCampaign] = useState(asset.campaign || "");
  const [aiGenerated, setAiGenerated] = useState(!!asset.aiGenerated);
  const [mediaTags, setMediaTags] = useState<any[]>(asset.assetTags?.map((t: any) => t.tag) || []);
  const [editing, setEditing] = useState(false);
  const [moveFolder, setMoveFolder] = useState(asset.folderId || "");

  const Icon = TYPE_ICON[asset.fileType] || FileText;
  const isImage = ["IMAGE", "LOGO", "BRAND_ASSET"].includes(asset.fileType);
  const scheduled: any[] = Array.isArray(asset.scheduledPosts) ? asset.scheduledPosts : [];

  async function save() {
    const tags = editTags.split(",").map((t: string) => t.trim()).filter(Boolean);
    await fetch(`/api/media/${asset.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalName: editName, description: editDesc, tags, platforms, campaign: campaign || null, aiGenerated }),
    });
    setEditing(false); onChanged();
  }

  async function toggleTag(name: string) {
    // create tag if missing, then link via normalized API
    const created = await fetch("/api/media/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) }).then((r) => r.json());
    const tagId = created.tag?.id;
    if (!tagId) return;
    const linked = mediaTags.some((t) => t.id === tagId);
    if (linked) {
      await fetch(`/api/media/${asset.id}/tag?tagId=${tagId}`, { method: "DELETE" });
      setMediaTags((p) => p.filter((t) => t.id !== tagId));
    } else {
      await fetch(`/api/media/${asset.id}/tag`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tagId }) });
      setMediaTags((p) => [...p, created.tag]);
    }
    onChanged();
  }

  async function togglePlatform(p: string) {
    const next = platforms.includes(p) ? platforms.filter((x) => x !== p) : [...platforms, p];
    setPlatforms(next);
    await fetch(`/api/media/${asset.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ platforms: next }) });
    onChanged();
  }

  async function archive() {
    if (asset.status === "ARCHIVED") {
      await fetch(`/api/media/${asset.id}/archive`, { method: "DELETE" });
    } else {
      await fetch(`/api/media/${asset.id}/archive`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: "user" }) });
    }
    onChanged(); onClose();
  }

  async function del(hard = false) {
    await fetch(`/api/media/${asset.id}${hard ? "?hard=1" : ""}`, { method: "DELETE" });
    onClose(); onChanged();
  }

  const meta = [
    ["Resolution", asset.width && asset.height ? `${asset.width}×${asset.height}` : "—"],
    ["Dimensions", asset.width && asset.height ? `${asset.width} × ${asset.height} px` : "—"],
    ["Duration", asset.duration ? `${asset.duration}s` : "—"],
    ["File Size", formatBytes(asset.fileSize)],
    ["Extension", asset.extension?.toUpperCase() || "—"],
    ["MIME Type", asset.mimeType],
    ["Folder", folders.find((f: any) => f.id === asset.folderId)?.name || "Root"],
    ["Uploaded By", asset.uploadedBy],
    ["Upload Date", new Date(asset.createdAt).toLocaleString()],
    ["Last Modified", new Date(asset.updatedAt).toLocaleString()],
    ["Last Used", asset.lastUsedAt ? new Date(asset.lastUsedAt).toLocaleString() : "—"],
    ["Usage Count", asset.usageCount],
    ["AI Generated", asset.aiGenerated ? "Yes" : "No"],
    ["Status", asset.status],
  ];

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0e0f17]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="text-sm font-semibold text-white">Asset Details</div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex h-48 items-center justify-center overflow-hidden rounded-2xl bg-black/30">
            {isImage && asset.url ? <img src={asset.url.startsWith("http") ? asset.url : `http://localhost:3000${asset.url}`} alt={asset.originalName} className="max-h-full object-contain" /> : <Icon className="h-14 w-14 text-white/40" />}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button onClick={() => fetch(`/api/media/${asset.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ favorited: !asset.favorited }) }).then(() => onChanged())} className={asset.favorited ? "text-amber-300" : "text-white/40 hover:text-amber-200"}><Star className="h-4 w-4" /></button>
            <button onClick={() => setEditing(!editing)} className="text-white/60 hover:text-white"><Pencil className="h-4 w-4" /></button>
            <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/50">{asset.fileType}</span>
          </div>

          {editing ? (
            <div className="mt-3 space-y-2">
              <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none" />
              <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} placeholder="Description" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none" />
              <input value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="tags, comma, separated" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none" />
              <input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="Campaign" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none" />
              <label className="flex items-center gap-2 text-xs text-white/60"><input type="checkbox" checked={aiGenerated} onChange={(e) => setAiGenerated(e.target.checked)} /> AI Generated</label>
              <div className="flex gap-2">
                <select value={moveFolder} onChange={(e) => setMoveFolder(e.target.value)} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-xs text-white/80">
                  <option value="">Root</option>
                  {folders.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <button onClick={() => fetch(`/api/media/${asset.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ folderId: moveFolder }) }).then(() => onChanged())} className="rounded-xl border border-white/10 px-2 text-xs text-white/70">Move</button>
              </div>
              <button onClick={save} className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 py-2 text-xs font-semibold text-white">Save</button>
            </div>
          ) : (
            <div className="mt-2">
              <div className="text-sm font-medium text-white">{asset.originalName}</div>
              {asset.description && <p className="mt-1 text-xs text-white/55">{asset.description}</p>}
              <input value={editTags} onChange={(e) => setEditTags(e.target.value)} onBlur={save} placeholder="tags, comma" className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70 outline-none" />
              {campaign && <div className="mt-1 text-[11px] text-white/50">Campaign: <span className="text-sky-200">{campaign}</span></div>}
            </div>
          )}

          {/* Tags (colored, normalized) */}
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40"><TagIcon className="h-3 w-3 text-sky-400" /> Tags</div>
            <div className="flex flex-wrap gap-1.5">
              {mediaTags.length === 0 && <span className="text-[11px] text-white/40">No tags</span>}
              {mediaTags.map((t) => (
                <button key={t.id} onClick={() => toggleTag(t.name)} className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] text-white/80">
                  <span className="h-2 w-2 rounded-full" style={{ background: t.color || "#38BDF8" }} /> #{t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Usage */}
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40"><Radio className="h-3 w-3 text-sky-400" /> Platform Usage</div>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORMS.map((p) => (
                <button key={p} onClick={() => togglePlatform(p)} className={`rounded-full border px-2 py-0.5 text-[10px] capitalize ${platforms.includes(p) ? "border-sky-400/40 bg-sky-400/15 text-sky-200" : "border-white/10 bg-white/5 text-white/40"}`}>{p}</button>
              ))}
            </div>
          </div>

          {/* Used In / Scheduled Posts */}
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40"><CalendarClock className="h-3 w-3 text-sky-400" /> Used In / Scheduled</div>
            {scheduled.length === 0 ? (
              <div className="text-[11px] text-white/40">Not scheduled on any platform yet.</div>
            ) : (
              <div className="space-y-1">
                {scheduled.map((s: any, i: number) => (
                  <div key={i} className="flex justify-between text-[11px]"><span className="text-white/60 capitalize">{s.platform}</span><span className="text-white/80">{s.scheduledAt ? new Date(s.scheduledAt).toLocaleString() : "—"}</span></div>
                ))}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">Metadata</div>
            <div className="space-y-1">
              {meta.map(([k, v]) => (
                <div key={k} className="flex justify-between text-[11px]"><span className="text-white/45">{k}</span><span className="text-white/80">{String(v)}</span></div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40"><Sparkles className="h-3 w-3 text-sky-400" /> AI Ready</div>
            <div className="flex flex-wrap gap-1.5">
              {["Auto Tag", "Generate Caption", "Alt Text", "OCR", "Smart Categorize"].map((t) => (
                <span key={t} className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] text-white/60">{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-1 border-t border-white/10 p-3 text-[10px]">
          <Act icon={<Copy className="h-4 w-4" />} label="Copy URL" onClick={() => navigator.clipboard.writeText(window.location.origin + asset.url)} />
          <Act icon={<Download className="h-4 w-4" />} label="Download" onClick={() => window.open(asset.url.startsWith("http") ? asset.url : `http://localhost:3000${asset.url}`, "_blank")} />
          <Act icon={<Share2 className="h-4 w-4" />} label="Share" onClick={() => navigator.clipboard.writeText(window.location.origin + asset.url)} />
          <Act icon={<Archive className="h-4 w-4" />} label="Archive" onClick={archive} />
          <Act icon={<RotateCcw className="h-4 w-4" />} label="Restore" onClick={() => fetch(`/api/media/${asset.id}/archive`, { method: "DELETE" }).then(() => { onChanged(); onClose(); })} />
          <Act icon={<FolderInput className="h-4 w-4" />} label="Move" onClick={() => setEditing(true)} />
          <Act icon={<Trash2 className="h-4 w-4" />} label="Delete" danger onClick={() => del(false)} />
          {asset.status === "TRASHED" && <Act icon={<Trash2 className="h-4 w-4" />} label="Purge" danger onClick={() => del(true)} />}
        </div>
      </motion.div>
    </div>
    </ModalPortal>
  );
}

function Act({ icon, label, onClick, danger }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 rounded-xl border border-white/10 py-2 text-white/70 transition hover:bg-white/5 ${danger ? "hover:text-rose-300" : ""}`}>
      {icon}<span>{label}</span>
    </button>
  );
}
