"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  X, Pencil, Copy, Trash2, Send, Ban, RefreshCw, CalendarClock, UserRound, Globe,
  Megaphone, Hash, Image as ImageIcon, History, ShieldCheck, CheckCircle2, AlertCircle, Clock,
} from "lucide-react";
import type { PlatformKey, PostStatus } from "@/types/scheduler";
import { PLATFORMS, STATUS_META } from "./platformMeta";
import { PlatformIcon } from "./PlatformSelector";
import StatusBadge from "./StatusBadge";
import { fmtDateTime, relTime } from "./dateUtils";
import ModalPortal from "@/components/ui/ModalPortal";

type Detail = {
  id: string;
  title: string | null;
  content: string | null;
  status: string;
  platform: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  hashtags: string[];
  link?: string | null;
  scheduled?: { scheduledAt: string; status?: string | null } | null;
  creator?: { id: string; name: string } | null;
  account?: { id: string; platform: string; accountName: string } | null;
  media?: { id: string; type: string; url: string }[];
  platforms?: { id: string; platform: string; status: string; platformPostId?: string | null; liveUrl?: string | null; error?: string | null; retryCount?: number }[];
  history?: {
    id: string; status: string; platform: string; accountId?: string | null;
    publishedBy: string; platformPostId?: string | null; liveUrl?: string | null;
    errorMessage?: string | null; jobId?: string | null; createdAt: string;
  }[];
  approvals?: { id: string; status: string; requestedBy: string; reviewedBy?: string | null; reviewedAt?: string | null; comment?: string | null }[];
  jobs?: { id: string; state: string; scheduledFor?: string | null; attempt?: number; lastError?: string | null }[];
};

type ActionType = "edit" | "duplicate" | "delete" | "publish" | "retry" | "cancel" | "close";

// Action availability matrix (no hardcoded role names — RBAC enforced server-side).
function availableActions(status: string): ActionType[] {
  switch (status) {
    case "DRAFT": return ["edit", "duplicate", "delete", "close"];
    case "PENDING_APPROVAL": return ["duplicate", "cancel", "close"];
    case "APPROVED": return ["publish", "duplicate", "close"];
    case "SCHEDULED": return ["publish", "duplicate", "cancel", "close"];
    case "PUBLISHING": return ["duplicate", "close"];
    case "FAILED": return ["retry", "duplicate", "edit", "close"];
    case "PUBLISHED": return ["duplicate", "close"];
    case "CANCELLED": return ["duplicate", "close"];
    default: return ["duplicate", "close"];
  }
}

export default function PostDetailsDrawer({
  postId,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onPublish,
  onRetry,
  onCancel,
}: {
  postId: string;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/publishing/${postId}`, { cache: "no-store" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to load");
      const json = await res.json();
      setDetail(json.post);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) load();
  }, [postId, load]);

  const platformKey = (detail?.platform?.toLowerCase() ?? "facebook") as PlatformKey;
  const meta = PLATFORMS[platformKey] ?? PLATFORMS.facebook;
  const actions = detail ? availableActions(detail.status) : [];

  const run = (a: ActionType) => {
    if (a === "edit") onEdit(detail!.id);
    else if (a === "duplicate") onDuplicate(detail!.id);
    else if (a === "delete") onDelete(detail!.id);
    else if (a === "publish") onPublish(detail!.id);
    else if (a === "retry") onRetry(detail!.id);
    else if (a === "cancel") onCancel(detail!.id);
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0e0f17] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <PlatformIcon platform={platformKey} />
              <span className="text-sm font-semibold text-white">Post Details</span>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white"><X className="h-4 w-4" /></button>
          </div>

          {loading && <div className="p-6 text-center text-xs text-white/40">Loading real post data…</div>}
          {error && <div className="m-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-300">{error}</div>}

          {detail && (
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 ${meta.soft}`}>
                    <PlatformIcon platform={platformKey} />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white">{detail.title ?? "(untitled)"}</div>
                    <div className={`text-xs ${meta.text}`}>{meta.label}</div>
                  </div>
                </div>
                <StatusBadge status={detail.status as PostStatus} />
              </div>

              <p className="text-sm leading-relaxed text-white/75">{detail.content ?? "—"}</p>

              {detail.media && detail.media.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {detail.media.map((m) => (
                    <div key={m.id} className="overflow-hidden rounded-xl border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.url} alt="" className="h-32 w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/45">
                  <ImageIcon className="h-3.5 w-3.5" /> No media attached
                </div>
              )}

              {detail.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {detail.hashtags.map((h) => (
                    <span key={h} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/60">
                      <Hash className="h-3 w-3" /> {h}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <Meta icon={CalendarClock} label="Scheduled" value={detail.scheduled?.scheduledAt ? fmtDateTime(detail.scheduled.scheduledAt) : "Not scheduled"} />
                <Meta icon={Globe} label="Timezone" value="Asia/Riyadh" />
                <Meta icon={UserRound} label="Creator" value={detail.creator?.name ?? detail.createdById} />
                <Meta icon={Megaphone} label="Account" value={detail.account?.accountName ?? "No linked account"} />
                <Meta icon={CalendarClock} label="Created" value={fmtDateTime(detail.createdAt)} />
                <Meta icon={Clock} label="Updated" value={relTime(detail.updatedAt)} />
                {detail.publishedAt && <Meta icon={CheckCircle2} label="Published" value={fmtDateTime(detail.publishedAt)} />}
              </div>

              {/* Publishing targets */}
              <Section title="Publishing Targets">
                {detail.platforms && detail.platforms.length > 0 ? (
                  <div className="space-y-1.5">
                    {detail.platforms.map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs">
                        <span className="text-white/75">{PLATFORMS[(p.platform.toLowerCase()) as PlatformKey]?.label ?? p.platform}</span>
                        <StatusBadge status={p.status as PostStatus} />
                      </div>
                    ))}
                  </div>
                ) : <Empty label="No publishing targets" />}
              </Section>

              {/* Approval */}
              <Section title="Approval">
                {detail.approvals && detail.approvals.length > 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs">
                    {detail.approvals.map((a) => (
                      <div key={a.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          {a.status === "APPROVED" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> : a.status === "REJECTED" ? <AlertCircle className="h-3.5 w-3.5 text-rose-300" /> : <Clock className="h-3.5 w-3.5 text-amber-300" />}
                          <span className="text-white/80">{(a.status ?? "PENDING").charAt(0) + (a.status ?? "pending").slice(1).toLowerCase()}</span>
                          {a.reviewedBy && <span className="text-white/45">by {a.reviewedBy}</span>}
                        </div>
                        {a.comment && <p className="text-white/55">{a.comment}</p>}
                      </div>
                    ))}
                  </div>
                ) : <Empty label="No approval record" />}
              </Section>

              {/* Publishing history / logs */}
              <Section title="Publishing History">
                {detail.history && detail.history.length > 0 ? (
                  <div className="space-y-2">
                    {[...detail.history].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).map((h) => (
                      <div key={h.id} className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white/85">{h.status}</span>
                          <span className="text-white/40">{fmtDateTime(h.createdAt)}</span>
                        </div>
                        <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-white/50">
                          <span>Provider: {PLATFORMS[(h.platform.toLowerCase()) as PlatformKey]?.label ?? h.platform}</span>
                          <span>Actor: {h.publishedBy}</span>
                          {h.jobId && <span>Job: {h.jobId}</span>}
                        </div>
                        {h.errorMessage && <p className="mt-1 text-rose-300/80">Error: {h.errorMessage}</p>}
                        {h.platformPostId && <p className="text-emerald-300/80">Provider ID: {h.platformPostId}</p>}
                        {h.liveUrl && <p className="text-sky-300/80 break-all">URL: {h.liveUrl}</p>}
                        {!h.errorMessage && !h.platformPostId && !h.liveUrl && <p className="mt-1 text-white/40">No provider response</p>}
                      </div>
                    ))}
                  </div>
                ) : <Empty label="No publishing history" />}
              </Section>

              {/* Provider / job state */}
              <Section title="Queue / Job State">
                {detail.jobs && detail.jobs.length > 0 ? (
                  <div className="space-y-1.5">
                    {detail.jobs.map((j) => (
                      <div key={j.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs">
                        <span className="text-white/70">{j.state}</span>
                        <span className="text-white/45">{j.scheduledFor ? fmtDateTime(j.scheduledFor) : "—"}{j.lastError ? ` · ${j.lastError}` : ""}</span>
                      </div>
                    ))}
                  </div>
                ) : <Empty label="No queued jobs" />}
              </Section>
            </div>
          )}

          {/* Action bar */}
          {detail && (
            <div className="grid grid-cols-3 gap-1.5 border-t border-white/10 p-3">
              {actions.filter((a) => a !== "close").map((a) => {
                const cfg: Record<string, { label: string; icon: any; cls: string }> = {
                  edit: { label: "Edit", icon: Pencil, cls: "border-white/10 text-white/70 hover:bg-white/5" },
                  duplicate: { label: "Duplicate", icon: Copy, cls: "border-white/10 text-white/70 hover:bg-white/5" },
                  delete: { label: "Delete", icon: Trash2, cls: "border-white/10 text-rose-300 hover:bg-rose-500/10" },
                  publish: { label: "Publish", icon: Send, cls: "border-sky-400/40 bg-gradient-to-r from-sky-500/20 to-rose-500/20 text-white hover:from-sky-500/30 hover:to-rose-500/30" },
                  retry: { label: "Retry", icon: RefreshCw, cls: "border-amber-400/30 text-amber-200 hover:bg-amber-500/10" },
                  cancel: { label: "Cancel", icon: Ban, cls: "border-rose-400/30 text-rose-200 hover:bg-rose-500/10" },
                };
                const c = cfg[a];
                return (
                  <button key={a} onClick={() => run(a)} className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-[10px] font-medium transition ${c.cls}`}>
                    <c.icon className="h-4 w-4" /> {c.label}
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </ModalPortal>
  );
}

function Meta({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-2">
      <Icon className="h-3.5 w-3.5 text-white/40" />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
        <div className="truncate text-white/80">{value}</div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/45">
        <History className="h-3.5 w-3.5" /> {title}
      </div>
      {children}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-dashed border-white/10 px-3 py-2 text-xs text-white/40">
      <ShieldCheck className="h-3.5 w-3.5" /> {label}
    </div>
  );
}
