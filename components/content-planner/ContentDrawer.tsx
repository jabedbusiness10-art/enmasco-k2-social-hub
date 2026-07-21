"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Pencil, Copy, FolderInput, Trash2, Send, Hash, Image as ImageIcon, Video, LayoutGrid, Calendar, User, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type { ContentPlan } from "@/types/contentPlanner";
import PlatformIcon from "./PlatformIcon";
import { StatusBadge, ApprovalBadge } from "./StatusBadge";
import ModalPortal from "@/components/ui/ModalPortal";

type RefUser = { id: string; name: string; email?: string; role?: string; color?: string };
type RefCampaign = { id: string; title: string; name?: string; color?: string };
type RefDept = { id: string; name: string };

function fmt(iso: string) {
  return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
function avatar(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function ContentDrawer({
  item,
  users = [],
  campaigns = [],
  departments = [],
  onClose,
  onEdit,
  onDuplicate,
  onMove,
  onDelete,
  onPublishNow,
  onApprove,
}: {
  item: ContentPlan | null;
  users?: RefUser[];
  campaigns?: RefCampaign[];
  departments?: RefDept[];
  onClose: () => void;
  onEdit: (i: ContentPlan) => void;
  onDuplicate: (i: ContentPlan) => void;
  onMove: (i: ContentPlan) => void;
  onDelete: (i: ContentPlan) => void;
  onPublishNow: (i: ContentPlan) => void;
  onApprove?: (decision: "APPROVED" | "REJECTED", note?: string) => void;
}) {
  const [tab, setTab] = useState<"preview" | "activity">("preview");
  const [approveNote, setApproveNote] = useState("");
  if (!item) return null;

  const userById = (id?: string) => users.find((u) => u.id === id);
  const campaignById = (id?: string) => campaigns.find((c) => c.id === id);
  const departmentById = (id?: string) => departments.find((d) => d.id === id);

  const creator = userById(item.creatorId);
  const assignee = userById(item.assigneeId);
  const campaign = campaignById(item.campaignId);
  const dept = departmentById(item.departmentId);
  const MediaIcon = item.media?.type === "VIDEO" ? Video : item.media?.type === "CAROUSEL" ? LayoutGrid : ImageIcon;

  const ACTIONS: { label: string; icon: any; onClick: () => void; danger?: boolean; primary?: boolean }[] = [
    { label: "Edit", icon: Pencil, onClick: () => onEdit(item) },
    { label: "Duplicate", icon: Copy, onClick: () => onDuplicate(item) },
    { label: "Move", icon: FolderInput, onClick: () => onMove(item) },
    { label: "Publish Now", icon: Send, onClick: () => onPublishNow(item), primary: true },
    { label: "Delete", icon: Trash2, onClick: () => onDelete(item), danger: true },
  ];

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0e0f17] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <PlatformIcon platform={item.platform} size={18} />
            <span className="text-sm font-semibold text-white">Content Details</span>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        {/* Action bar */}
        <div className="grid grid-cols-3 gap-1.5 border-b border-white/10 p-3">
          {ACTIONS.map((a) => (
            <button
              key={a.label}
              onClick={a.onClick}
              className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-[10px] font-medium transition ${
                a.primary
                  ? "border-sky-400/40 bg-gradient-to-r from-sky-500/20 to-rose-500/20 text-white hover:from-sky-500/30 hover:to-rose-500/30"
                  : a.danger
                  ? "border-white/10 text-rose-300 hover:bg-rose-500/10"
                  : "border-white/10 text-white/70 hover:bg-white/5"
              }`}
            >
              <a.icon className="h-4 w-4" /> {a.label}
            </button>
          ))}

        {onApprove && item.approval.status !== "APPROVED" && item.approval.status !== "REJECTED" && (
          <div className="border-b border-white/10 px-4 py-3">
            <p className="mb-2 text-xs font-medium text-white/70">Approval required</p>
            <textarea
              value={approveNote}
              onChange={(e) => setApproveNote(e.target.value)}
              placeholder="Approval note (optional)"
              className="mb-2 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white placeholder:text-white/30"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={() => onApprove("APPROVED", approveNote || undefined)}
                className="flex-1 rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-100 hover:bg-emerald-500/25"
              >
                Approve
              </button>
              <button
                onClick={() => onApprove("REJECTED", approveNote || undefined)}
                className="flex-1 rounded-lg border border-rose-400/30 bg-rose-500/15 px-3 py-1.5 text-xs font-medium text-rose-100 hover:bg-rose-500/25"
              >
                Reject
              </button>
            </div>
          </div>
        )}
        </div>

        <div className="flex gap-1 border-b border-white/10 px-4 pt-3">
          {(["preview", "activity"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`mr-3 border-b-2 pb-2 text-xs capitalize transition ${
                tab === t ? "border-sky-400 text-white" : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              {t === "preview" ? "Content Preview" : "Activity"}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {tab === "preview" ? (
            <>
              {/* Preview */}
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                <div className="flex h-44 items-center justify-center bg-gradient-to-br from-white/5 to-white/[0.01]">
                  {item.media && item.media.type !== "NONE" ? (
                    <div className="flex flex-col items-center gap-2 text-white/40">
                      <MediaIcon className="h-12 w-12" />
                      <span className="text-[11px] uppercase tracking-wide">{item.media.type} preview</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-white/30">No media attached</span>
                  )}
                </div>
                <div className="space-y-2 p-3">
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform={item.platform} size={14} />
                    <StatusBadge status={item.status} />
                    <ApprovalBadge status={item.approval.status} />
                  </div>
                  <div className="text-sm font-semibold text-white">{item.title}</div>
                  <p className="text-xs leading-relaxed text-white/65">{item.caption}</p>
                  {item.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.hashtags.map((h) => (
                        <span key={h} className="flex items-center gap-0.5 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-sky-200">
                          <Hash className="h-2.5 w-2.5" />{h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Meta grid */}
              <MetaRow icon={Calendar} label="Publishing Time" value={`${fmt(item.schedule.scheduledAt)} · ${item.schedule.timezone}`} />
              <MetaRow icon={User} label="Assigned User" value={assignee?.name ?? creator?.name ?? "Unassigned"} sub={assignee?.role} avatarColor={assignee?.color} />
              <MetaRow icon={User} label="Created By" value={creator?.name ?? "—"} avatarColor={creator?.color} />
              {campaign && <MetaRow label="Campaign" value={campaign.title ?? campaign.name ?? "—"} dotColor={campaign.color} icon={Hash} />}
              {dept && <MetaRow label="Department" value={dept.name} icon={User} />}
              <MetaRow
                label="Approval Status"
                value={item.approval.status}
                icon={item.approval.status === "APPROVED" || item.approval.status === "NOT_REQUIRED" ? CheckCircle2 : item.approval.status === "REJECTED" ? AlertCircle : Clock}
              />
              {item.notes && (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">Notes</div>
                  <p className="text-xs text-white/65">{item.notes}</p>
                </div>
              )}
              {item.status === "FAILED" && item.schedule.failedReason && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
                  Failed: {item.schedule.failedReason}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-2 text-xs text-white/60">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                Created {fmt(item.createdAt)} by {creator?.name}
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                Last updated {fmt(item.updatedAt)}
              </div>
              {item.approval.decidedBy && (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  Approval decided by {item.approval.decidedBy}
                  {item.approval.note ? ` — ${item.approval.note}` : ""}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
    </ModalPortal>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
  sub,
  dotColor,
  avatarColor,
}: {
  icon?: any;
  label: string;
  value: string;
  sub?: string;
  dotColor?: string;
  avatarColor?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
      <span className="flex items-center gap-2 text-[11px] text-white/45">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </span>
      <span className="flex items-center gap-1.5 text-right text-xs text-white">
        {avatarColor && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: avatarColor }}>
            {avatar(value)}
          </span>
        )}
        {dotColor && <span className="h-2.5 w-2.5 rounded-full" style={{ background: dotColor }} />}
        <span className="flex flex-col">
          <span>{value}</span>
          {sub && <span className="text-[10px] text-white/35">{sub}</span>}
        </span>
      </span>
    </div>
  );
}
