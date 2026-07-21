"use client";

import { useState, useEffect, useRef } from "react";
import { X, Save, Loader2, Plus, Upload, Image as ImageIcon, Video, Trash2, ExternalLink } from "lucide-react";
import type { ContentPlan, PlatformKey, ContentStatus, ContentPlatform } from "@/types/contentPlanner";
import PlatformIcon from "./PlatformIcon";
import ModalPortal from "@/components/ui/ModalPortal";

type RefUser = { id: string; name: string };
type RefCampaign = { id: string; title: string; name?: string };
type RefDept = { id: string; name: string };
type RefAccount = { id: string; platform: string; accountName: string; accountHandle?: string | null; status: string };
type RefPlatform = { key: PlatformKey; name: string; color: string; short: string };

export interface PlanDraft {
  id?: string;
  title: string;
  caption: string;
  platforms: ContentPlan["platforms"];
  status: ContentStatus;
  scheduledAt: string;
  campaignId?: string;
  departmentId?: string;
  creatorId: string;
  assigneeId?: string;
  hashtags: string[];
  notes?: string;
  media: ContentPlan["media"];
}

const PLATFORMS: RefPlatform[] = [
  { key: "facebook", name: "Facebook", color: "#1877F2", short: "FB" },
  { key: "instagram", name: "Instagram", color: "#E1306C", short: "IG" },
  { key: "linkedin", name: "LinkedIn", color: "#0A66C2", short: "LI" },
  { key: "x", name: "X", color: "#1DA1F2", short: "X" },
  { key: "youtube", name: "YouTube", color: "#FF0000", short: "YT" },
  { key: "tiktok", name: "TikTok", color: "#00F2EA", short: "TT" },
];

const STATUS_OPTIONS: ContentStatus[] = ["DRAFT", "REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED", "FAILED"];

export default function PlanModal({
  initial,
  users = [],
  campaigns = [],
  departments = [],
  accounts = [],
  onClose,
  onSave,
}: {
  initial?: ContentPlan | null;
  users?: RefUser[];
  campaigns?: RefCampaign[];
  departments?: RefDept[];
  accounts?: RefAccount[];
  onClose: () => void;
  onSave: (draft: PlanDraft) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [caption, setCaption] = useState(initial?.caption ?? "");
  const [platforms, setPlatforms] = useState<ContentPlatform[]>(
    (initial?.platforms?.length ? initial.platforms : (initial?.platform ? [{ id: undefined, platform: initial.platform, accountId: null, status: "QUEUED" }] : [])) as ContentPlatform[],
  );
  const [status, setStatus] = useState<ContentStatus>(initial?.status ?? "DRAFT");
  const [scheduledAt, setScheduledAt] = useState(() => toLocalInput(initial?.schedule.scheduledAt ?? new Date().toISOString()));
  const [campaignId, setCampaignId] = useState(initial?.campaignId ?? "");
  const [departmentId, setDepartmentId] = useState(initial?.departmentId ?? "");
  const [creatorId, setCreatorId] = useState(initial?.creatorId ?? users[0]?.id ?? "");
  const [assigneeId, setAssigneeId] = useState(initial?.assigneeId ?? users[0]?.id ?? "");
  const [hashtagInput, setHashtagInput] = useState((initial?.hashtags ?? []).join(", "));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [media, setMedia] = useState<ContentPlan["media"]>(initial?.media ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mediaInput, setMediaInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const charCount = caption.length;

  const platformMeta = (key: PlatformKey) => PLATFORMS.find((p) => p.key === key);

  const togglePlatform = (key: PlatformKey, account?: RefAccount) => {
    setPlatforms((cur) => {
      const list = cur ?? [];
      const exists = list.find((p) => p.platform === key);
      if (exists) return list.filter((p) => p.platform !== key) as ContentPlatform[];
      return [...list, { id: undefined, platform: key, accountId: account?.id ?? null, status: "QUEUED" as const }] as ContentPlatform[];
    });
  };

  const removePlatform = (key: PlatformKey) => setPlatforms((cur) => ((cur ?? []) as ContentPlatform[]).filter((p) => p.platform !== key));
  const setAccountFor = (key: PlatformKey, accountId: string | null) =>
    setPlatforms((cur) => ((cur ?? []) as ContentPlatform[]).map((p) => (p.platform === key ? { ...p, accountId } as ContentPlatform : p)));

  const addMediaFromUrl = () => {
    const trimmed = mediaInput.trim();
    if (!trimmed) return;
    const isVideo = /\.(mp4|mov|webm)$/i.test(trimmed);
    setMedia((cur) => [...cur, { id: undefined, type: isVideo ? "VIDEO" : "IMAGE", url: trimmed, thumbnail: null, alt: null, order: cur.length }]);
    setMediaInput("");
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const form = new FormData();
    Array.from(files).forEach((f) => form.append("files", f));
    try {
      const res = await fetch("/api/media/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error((await res.json()).error ?? "Upload failed");
      const json = await res.json();
      const mapped = (json.assets ?? []).map((a: any, idx: number) => ({
        id: a.id,
        type: (a.mimeType?.startsWith("video") ? "VIDEO" : "IMAGE") as ContentPlan["media"][number]["type"],
        url: a.url ?? a.fileName,
        thumbnail: a.thumbnail ?? null,
        alt: a.originalName ?? null,
        order: media.length + idx,
      }));
      setMedia((cur) => [...cur, ...mapped]);
    } catch (err: any) {
      setErrors((x) => ({ ...x, media: err?.message ?? "Upload failed" }));
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "Title is required";
    if (!platforms.length) next.platforms = "Select at least one connected account";
    if (!scheduledAt) next.scheduledAt = "Schedule is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const normalizedHashtags = parseHashtags(hashtagInput);
    const dedupedMedia = media.map((m, i) => ({ ...m, order: i }));
    await onSave({
      id: initial?.id,
      title: title.trim() || "Untitled Content",
      caption,
      platforms: platforms.map((p) => ({ ...p, platform: p.platform.toLowerCase() as PlatformKey })),
      status,
      scheduledAt: new Date(scheduledAt).toISOString(),
      campaignId: campaignId || undefined,
      departmentId: departmentId || undefined,
      creatorId,
      assigneeId: assigneeId || undefined,
      hashtags: normalizedHashtags,
      notes: notes.trim() || undefined,
      media: dedupedMedia,
    });
    setSubmitting(false);
  };

  const selectedAccountIds = platforms.map((p) => p.accountId).filter(Boolean);

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
        <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0e0f17] shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <span className="text-sm font-semibold text-white">{initial ? "Edit Content" : "Create Content"}</span>
            <button onClick={onClose} className="rounded-lg border border-white/10 p-1.5 text-white/50 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[calc(92vh-130px)] space-y-6 overflow-y-auto p-5">
            <Section label="Content">
              <Field label="Title" error={errors.title}>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Content title" />
              </Field>
              <Field label="Caption" error={errors.caption}>
                <div className="relative">
                  <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={4} className={clsx(inputCls, "pr-12")} placeholder="Write the post copy…" />
                  <div className={`absolute bottom-1.5 right-1.5 text-[10px] ${charCount > 1800 ? "text-amber-300" : "text-white/35"}`}>{charCount}/2000</div>
                </div>
              </Field>
            </Section>

            <Section label="Channels">
              <Field label="Connected Accounts" error={errors.platforms}>
                {!accounts.length ? (
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-white/60">
                    No connected social accounts available.
                    <button onClick={() => (window.location.href = "/dashboard/social/accounts")} className="ml-2 text-sky-300 underline">Social Accounts</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {PLATFORMS.filter((p) => accounts.some((a) => a.platform.toLowerCase() === p.key)).map((meta) => {
                      const selected = platforms.find((p) => p.platform === meta.key);
                      const isActive = !!selected;
                      const accountOptions = accounts.filter((a) => a.platform.toLowerCase() === meta.key);
                      const selectedAccount = selected?.accountId ? accountOptions.find((a) => a.id === selected.accountId) : undefined;
                      return (
                        <div key={meta.key} className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-2">
                          <button onClick={() => togglePlatform(meta.key)} className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${isActive ? "border-sky-400/40 bg-sky-400/10 text-white" : "border-white/10 text-white/60 hover:bg-white/5"}`}>
                            <span className="inline-flex h-4 w-4 items-center justify-center rounded text-white" style={{ background: meta.color, fontSize: 9 }}>{meta.short}</span>
                            {meta.name}
                          </button>
                          {isActive && (
                            <select
                              value={selected?.accountId ?? ""}
                              onChange={(e) => setAccountFor(meta.key, e.target.value || null)}
                              className={clsx(inputCls, "h-9 w-48")}
                            >
                              <option value="">Select account</option>
                              {accountOptions.map((a) => (
                                <option key={a.id} value={a.id} className="bg-[#0e0f17] text-white">
                                  {a.accountName} {a.accountHandle ? `(${a.accountHandle})` : ""} [{a.status}]
                                </option>
                              ))}
                            </select>
                          )}
                          <div className="ml-auto flex items-center gap-2">
                            {selectedAccount && <span className="text-[10px] text-white/55">{selectedAccount.accountName}</span>}
                            {isActive && (
                              <button onClick={() => removePlatform(meta.key)} className="rounded-lg border border-white/10 p-1.5 text-white/55 hover:text-white">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Field>
            </Section>

            <Section label="Media">
              <div className="space-y-3">
                <Field label="Upload Files" error={errors.media}>
                  <div className="flex items-center gap-2">
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" multiple onChange={onFileSelected} className="hidden" />
                    <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/5">
                      <Upload className="h-3.5 w-3.5" /> Browse
                    </button>
                    <span className="text-[10px] text-white/40">JPG/PNG/WEBP, MP4/WEBM</span>
                  </div>
                </Field>
                <Field label="Media Library URL">
                  <div className="flex gap-2">
                    <input value={mediaInput} onChange={(e) => setMediaInput(e.target.value)} className={clsx(inputCls, "flex-1")} placeholder="Paste existing media URL…" />
                    <button onClick={addMediaFromUrl} className="flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/5">
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </div>
                </Field>
                {!!media.length && (
                  <div className="grid grid-cols-3 gap-2">
                    {media.map((m, idx) => (
                      <div key={`${m.url}-${idx}`} className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
                        <div className="flex items-center justify-between p-2">
                          <div className="flex items-center gap-2 text-[11px] text-white/70">
                            {m.type === "VIDEO" ? <Video className="h-3.5 w-3.5 text-white/50" /> : <ImageIcon className="h-3.5 w-3.5 text-white/50" />}
                            {m.type}
                          </div>
                          <button onClick={() => setMedia((cur) => cur.filter((_, i) => i !== idx))} className="text-white/40 hover:text-white">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {m.type === "IMAGE" && m.url ? (
                          <img src={m.url} alt={m.alt ?? "preview"} className="h-24 w-full object-cover" />
                        ) : m.type === "VIDEO" && m.thumbnail ? (
                          <img src={m.thumbnail} alt="video" className="h-24 w-full object-cover" />
                        ) : (
                          <div className="flex h-24 items-center justify-center text-[10px] text-white/35">No preview</div>
                        )}
                        <div className="truncate p-2 text-[10px] text-white/35" title={m.url}>{m.url}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Section>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Campaign">
                <select value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className={clsx(inputCls, "cursor-pointer")}>
                  <option value="" className="bg-[#0e0f17] text-white/55">— None —</option>
                  {campaigns.map((c) => <option key={c.id} value={c.id} className="bg-[#0e0f17] text-white">{c.title ?? c.name}</option>)}
                </select>
              </Field>
              <Field label="Status" error={errors.status}>
                <select value={status} onChange={(e) => setStatus(e.target.value as ContentStatus)} className={clsx(inputCls, "cursor-pointer")}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="bg-[#0e0f17] text-white">{s}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Department">
                <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className={clsx(inputCls, "cursor-pointer")}>
                  <option value="" className="bg-[#0e0f17] text-white/55">— None —</option>
                  {departments.map((d) => <option key={d.id} value={d.id} className="bg-[#0e0f17] text-white">{d.name}</option>)}
                </select>
              </Field>
              <Field label="Publishing Time" error={errors.scheduledAt}>
                <div className="flex gap-2">
                  <input type="date" value={scheduledAt.slice(0, 10)} onChange={(e) => { const t = scheduledAt.slice(11, 16) || "00:00"; setScheduledAt(`${e.target.value}T${t}`); }} className={clsx(inputCls, "flex-1")} />
                  <input type="time" value={scheduledAt.slice(11, 16)} onChange={(e) => { const d = scheduledAt.slice(0, 10); setScheduledAt(`${d}T${e.target.value}:00`); }} className={clsx(inputCls, "w-24")} />
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Creator">
                <select value={creatorId} onChange={(e) => setCreatorId(e.target.value)} className={clsx(inputCls, "cursor-pointer")}>
                  {users.map((u) => <option key={u.id} value={u.id} className="bg-[#0e0f17] text-white">{u.name}</option>)}
                </select>
              </Field>
              <Field label="Assignee">
                <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className={clsx(inputCls, "cursor-pointer")}>
                  <option value="" className="bg-[#0e0f17] text-white/55">— Unassigned —</option>
                  {users.map((u) => <option key={u.id} value={u.id} className="bg-[#0e0f17] text-white">{u.name}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Hashtags">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {parseHashtags(hashtagInput).map((h) => (
                    <span key={h} className="flex items-center gap-1 rounded-lg bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-200">
                      #{h}
                      <button onClick={() => setHashtagInput((prev) => prev.split(",").map((x) => x.trim()).filter((x) => x !== h).join(", "))} className="text-white/40 hover:text-white">×</button>
                    </span>
                  ))}
                </div>
                <input value={hashtagInput} onChange={(e) => setHashtagInput(e.target.value)} className={inputCls} placeholder="Type tag and press comma or space…" />
              </div>
            </Field>

            <Field label="Notes">
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputCls} placeholder="Internal notes…" />
            </Field>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
            <div className="text-[10px] text-white/35">{initial ? "Saving updates" : "Creating new content"}</div>
            <div className="flex gap-2">
              <button onClick={onClose} className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:text-white">Cancel</button>
              <button onClick={save} disabled={submitting} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-50">
                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {submitting ? "Saving…" : initial ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function Section({ label, children }: { label: string; children: any }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">{label}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: any; error?: string }) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">{label}</div>
      {children}
      {error && <div className="mt-1 text-[10px] text-rose-300">{error}</div>}
    </div>
  );
}

const inputCls = "h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none transition focus:border-sky-400/40 disabled:opacity-50";

function parseHashtags(raw: string) {
  return raw.split(/[,\s]+/).map((h) => h.trim().replace(/^#/, "")).filter(Boolean);
}

function clsx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}
