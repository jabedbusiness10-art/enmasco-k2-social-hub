"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Save, Loader2 } from "lucide-react";
import type { ContentPlan, PlatformKey, ContentStatus } from "@/types/contentPlanner";
import PlatformIcon from "./PlatformIcon";
import ModalPortal from "@/components/ui/ModalPortal";

type RefUser = { id: string; name: string };
type RefCampaign = { id: string; title: string; name?: string };
type RefDept = { id: string; name: string };
type RefPlatform = { key: PlatformKey; name: string; color: string; short: string };

const STATUS_OPTIONS: ContentStatus[] = ["DRAFT", "REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED", "FAILED"];

export interface PlanDraft {
  id?: string;
  title: string;
  caption: string;
  platform: PlatformKey;
  status: ContentStatus;
  scheduledAt: string;
  campaignId?: string;
  departmentId?: string;
  creatorId: string;
  assigneeId?: string;
  hashtags: string[];
  notes?: string;
}

export default function PlanModal({
  initial,
  users = [],
  campaigns = [],
  departments = [],
  platforms = [],
  onClose,
  onSave,
}: {
  initial?: ContentPlan | null;
  users?: RefUser[];
  campaigns?: RefCampaign[];
  departments?: RefDept[];
  platforms?: RefPlatform[];
  onClose: () => void;
  onSave: (draft: PlanDraft) => void;
}) {
  const PLATFORM_KEYS: PlatformKey[] = platforms.map((p) => p.key);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [caption, setCaption] = useState(initial?.caption ?? "");
  const [platform, setPlatform] = useState<PlatformKey>(initial?.platform ?? "facebook");
  const [status, setStatus] = useState<ContentStatus>(initial?.status ?? "DRAFT");
  const [scheduledAt, setScheduledAt] = useState(toLocalInput(initial?.schedule.scheduledAt ?? new Date().toISOString()));
  const [campaignId, setCampaignId] = useState(initial?.campaignId ?? "");
  const [departmentId, setDepartmentId] = useState(initial?.departmentId ?? "");
  const [creatorId, setCreatorId] = useState(initial?.creatorId ?? users[0]?.id ?? "");
  const [assigneeId, setAssigneeId] = useState(initial?.assigneeId ?? users[0]?.id ?? "");
  const [hashtagInput, setHashtagInput] = useState((initial?.hashtags ?? []).join(", "));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const charCount = useMemo(() => caption.length, [caption]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "Title is required";
    if (!scheduledAt) next.scheduledAt = "Schedule is required";
    if (charCount > 2000) next.caption = "Caption exceeds 2000 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSubmitting(true);
    await onSave({
      id: initial?.id,
      title: title.trim() || "Untitled Content",
      caption,
      platform,
      status,
      scheduledAt: new Date(scheduledAt).toISOString(),
      campaignId: campaignId || undefined,
      departmentId: departmentId || undefined,
      creatorId,
      assigneeId: assigneeId || undefined,
      hashtags: parseHashtags(hashtagInput),
      notes: notes.trim() || undefined,
    });
    setSubmitting(false);
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
        <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0e0f17] shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <span className="text-sm font-semibold text-white">{initial ? "Edit Content" : "Create Content"}</span>
            <button onClick={onClose} className="rounded-lg border border-white/10 p-1.5 text-white/50 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[calc(92vh-130px)] space-y-4 overflow-y-auto p-5">
            {/* Title */}
            <Field label="Title" error={errors.title}>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Content title" />
            </Field>

            {/* Caption with counter */}
            <Field label="Caption" error={errors.caption}>
              <div className="relative">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  className={clsx(inputCls, "pr-12")}
                  placeholder="Write the post copy…"
                />
                <div className={`absolute bottom-1.5 right-1.5 text-[10px] ${charCount > 1800 ? "text-amber-300" : "text-white/35"}`}>
                  {charCount}/2000
                </div>
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              {/* Platform Badges */}
              <Field label="Platform">
                <div className="flex flex-wrap gap-2">
                  {PLATFORM_KEYS.map((k) => {
                    const meta = platforms.find((p) => p.key === k);
                    const active = platform === k;
                    return (
                      <button
                        key={k}
                        onClick={() => setPlatform(k)}
                        className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition ${
                          active ? `border-sky-400/50 bg-sky-400/10 text-white` : "border-white/10 text-white/60 hover:bg-white/5"
                        }`}
                      >
                        {meta && <span className="inline-flex h-4 w-4 items-center justify-center rounded text-white" style={{ background: meta.color, fontSize: 9 }}>{meta.short}</span>}
                        {meta?.name ?? k}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* Status */}
              <Field label="Status" error={errors.status}>
                <select value={status} onChange={(e) => setStatus(e.target.value as ContentStatus)} className={clsx(inputCls, "cursor-pointer")}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="bg-[#0e0f17] text-white">{s}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Campaign">
                <select value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className={clsx(inputCls, "cursor-pointer")}>
                  <option value="" className="bg-[#0e0f17] text-white/55">— None —</option>
                  {campaigns.map((c) => <option key={c.id} value={c.id} className="bg-[#0e0f17] text-white">{c.title ?? c.name}</option>)}
                </select>
              </Field>
              <Field label="Department">
                <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className={clsx(inputCls, "cursor-pointer")}>
                  <option value="" className="bg-[#0e0f17] text-white/55">— None —</option>
                  {departments.map((d) => <option key={d.id} value={d.id} className="bg-[#0e0f17] text-white">{d.name}</option>)}
                </select>
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

            {/* DateTime */}
            <Field label="Publishing Time" error={errors.scheduledAt}>
              <div className="flex gap-2">
                <input type="date" value={scheduledAt.slice(0, 10)} onChange={(e) => {
                  const t = scheduledAt.slice(11, 16) || "00:00";
                  setScheduledAt(`${e.target.value}T${t}`);
                }} className={clsx(inputCls, "flex-1")} />
                <input type="time" value={scheduledAt.slice(11, 16)} onChange={(e) => {
                  const d = scheduledAt.slice(0, 10);
                  setScheduledAt(`${d}T${e.target.value}:00`);
                }} className={clsx(inputCls, "w-24")} />
              </div>
            </Field>

            {/* Hashtags with chips */}
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
                <input
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  className={inputCls}
                  placeholder="Type tag and press comma or space…"
                />
              </div>
            </Field>

            {/* Notes */}
            <Field label="Notes">
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputCls} placeholder="Internal notes…" />
            </Field>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
            <div className="text-[10px] text-white/35">{initial ? "Saving updates" : "Creating new content"}</div>
            <div className="flex gap-2">
              <button onClick={onClose} className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:text-white">Cancel</button>
              <button
                onClick={save}
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-50"
              >
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

const inputCls =
  "h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none transition focus:border-sky-400/40 disabled:opacity-50";

function Field({ label, children, error }: { label: string; children: any; error?: string }) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">{label}</div>
      {children}
      {error && <div className="mt-1 text-[10px] text-rose-300">{error}</div>}
    </div>
  );
}

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
