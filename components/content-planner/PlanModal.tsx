"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";
import type { ContentPlan, PlatformKey, ContentStatus, ApprovalStatus } from "@/types/contentPlanner";
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
  const [scheduledAt, setScheduledAt] = useState(
    toLocalInput(initial?.schedule.scheduledAt ?? new Date().toISOString()),
  );
  const [campaignId, setCampaignId] = useState(initial?.campaignId ?? "");
  const [departmentId, setDepartmentId] = useState(initial?.departmentId ?? "");
  const [creatorId, setCreatorId] = useState(initial?.creatorId ?? users[0]?.id ?? "");
  const [assigneeId, setAssigneeId] = useState(initial?.assigneeId ?? users[0]?.id ?? "");
  const [hashtags, setHashtags] = useState((initial?.hashtags ?? []).join(", "));
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const save = () => {
    onSave({
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
      hashtags: hashtags.split(",").map((h) => h.trim().replace(/^#/, "")).filter(Boolean),
      notes: notes.trim() || undefined,
    });
  };

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0e0f17] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <span className="text-sm font-semibold text-white">{initial ? "Edit Content" : "Create Content"}</span>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          <Field label="Title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Content title" />
          </Field>
          <Field label="Caption">
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={3} className={inputCls} placeholder="Write the post copy…" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Platform">
              <div className="flex flex-wrap gap-1.5">
                {PLATFORM_KEYS.map((k) => (
                  <button
                    key={k}
                    onClick={() => setPlatform(k)}
                    className={`rounded-lg p-1.5 transition ${platform === k ? "ring-2 ring-sky-400" : "opacity-60 hover:opacity-100"}`}
                  >
                    <PlatformIcon platform={k} size={16} />
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Status">
              <select value={status} onChange={(e) => setStatus(e.target.value as ContentStatus)} className={inputCls}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Campaign">
              <select value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className={inputCls}>
                <option value="">— None —</option>
                {campaigns.map((c) => <option key={c.id} value={c.id}>{c.title ?? c.name}</option>)}
              </select>
            </Field>
            <Field label="Department">
              <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className={inputCls}>
                <option value="">— None —</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Creator">
              <select value={creatorId} onChange={(e) => setCreatorId(e.target.value)} className={inputCls}>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </Field>
            <Field label="Assignee">
              <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className={inputCls}>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Publishing Time">
            <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className={inputCls} />
          </Field>

          <Field label="Hashtags (comma separated)">
            <input value={hashtags} onChange={(e) => setHashtags(e.target.value)} className={inputCls} placeholder="Eid2026, Sale, ENMASCO" />
          </Field>

          <Field label="Notes">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputCls} placeholder="Internal notes…" />
          </Field>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/10 p-4">
          <button onClick={onClose} className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/70">Cancel</button>
          <button onClick={save} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 px-3 py-1.5 text-xs font-semibold text-white">
            <Save className="h-3.5 w-3.5" /> {initial ? "Save Changes" : "Create"}
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}

const inputCls =
  "h-9 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-sky-400/40";

function Field({ label, children }: { label: string; children: any }) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">{label}</div>
      {children}
    </div>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}
