"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Pencil, Copy, FolderInput, Trash2, Send, Hash, Image as ImageIcon, Video, LayoutGrid, Calendar, User, CheckCircle2, Clock, AlertCircle, MessageSquare, ExternalLink } from "lucide-react";
import type { ContentPlan } from "@/types/contentPlanner";
import PlatformIcon from "./PlatformIcon";
import { StatusBadge, ApprovalBadge } from "./StatusBadge";
import ModalPortal from "@/components/ui/ModalPortal";
import ActivityTimeline from "./ActivityTimeline";
import type { PlanningActivity } from "@/types/contentPlanner";

type RefUser = { id: string; name: string; email?: string; role?: string; color?: string };
type RefCampaign = { id: string; title: string; name?: string; color?: string };
type RefDept = { id: string; name: string };

function fmt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
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
  const hasMedia = item.media && item.media.type !== "NONE";

  const pendingApproval = item.approval.status === "PENDING";

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ x: 32, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 32, opacity: 0 }}
          className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0e0f17] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <PlatformIcon platform={item.platform} size={18} />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white leading-tight">{item.title}</span>
                <span className="text-[10px] text-white/40">{item.platform.toUpperCase()}</span>
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg border border-white/10 p-1.5 text-white/50 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Section: Quick Actions */}
          <div className="border-b border-white/10 p-3">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">Quick Actions</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Edit", icon: Pencil, onClick: () => onEdit(item), cls: "" },
                { label: "Duplicate", icon: Copy, onClick: () => onDuplicate(item), cls: "" },
                { label: "Move", icon: FolderInput, onClick: () => onMove(item), cls: "" },
                { label: "Publish Now", icon: Send, onClick: () => onPublishNow(item), cls: "col-span-3 bg-gradient-to-r from-sky-500/20 to-rose-500/20 border-sky-400/30 text-white hover:from-sky-500/30 hover:to-rose-500/30" },
                { label: "Delete", icon: Trash2, onClick: () => onDelete(item), cls: "text-rose-300 border-rose-500/30 hover:bg-rose-500/10" },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={a.onClick}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-1.5 text-xs font-medium transition ${
                    a.cls || "border-white/10 text-white/70 hover:bg-white/5"
                  }`}
                >
                  <a.icon className="h-3.5 w-3.5" />
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Approval */}
          {onApprove && pendingApproval && (
            <div className="border-b border-white/10 p-3">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">Approval</div>
              <textarea
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
                placeholder="Approval note (optional)"
                className="mb-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white placeholder:text-white/30"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => onApprove("APPROVED", approveNote || undefined)}
                  className="flex-1 rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/25"
                >
                  Approve
                </button>
                <button
                  onClick={() => onApprove("REJECTED", approveNote || undefined)}
                  className="flex-1 rounded-xl border border-rose-400/30 bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/25"
                >
                  Reject
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 border-b border-white/10 px-4 pt-2">
            {(["preview", "activity"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`mr-3 border-b-2 pb-2 text-xs font-medium capitalize transition ${
                  tab === t ? "border-sky-400 text-white" : "border-transparent text-white/50 hover:text-white"
                }`}
              >
                {t === "preview" ? "Preview" : "Activity"}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {tab === "preview" ? (
              <div className="space-y-4">
                {/* Preview Section */}
                <SectionLabel label="Content Preview" />
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                  <div className="flex min-h-[120px] items-center justify-center bg-gradient-to-br from-white/5 to-white/[0.01]">
                    {hasMedia ? (
                      <div className="flex flex-col items-center gap-2 text-white/40">
                        <MediaIcon className="h-10 w-10" />
                        <span className="text-[11px] uppercase tracking-wide">{item.media!.type} preview</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-white/30">
                        <ImageIcon className="h-8 w-8" />
                        <span className="text-[11px] uppercase tracking-wide">No media attached</span>
                        <span className="text-[10px] text-white/25">Visual content not uploaded yet</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 p-3">
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={item.platform} size={14} />
                      <StatusBadge status={item.status} />
                      <ApprovalBadge status={item.approval.status} />
                    </div>
                    <div className="text-sm font-semibold text-white">{item.title}</div>
                    {item.caption && <p className="text-xs leading-relaxed text-white/65">{item.caption}</p>}
                    {item.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.hashtags.map((h) => (
                          <span key={h} className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-0.5 text-[10px] text-sky-200">
                            <Hash className="h-2.5 w-2.5" />{h}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Publishing Info Section */}
                <SectionLabel label="Publishing Information" />
                <div className="space-y-2">
                  <MetaRow icon={Calendar} label="Publishing Time" value={fmt(item.schedule.scheduledAt)} sub={item.schedule.timezone} />
                  <MetaRow icon={User} label="Created By" value={creator?.name ?? "—"} avatarColor={creator?.color} />
                  <MetaRow icon={User} label="Assigned To" value={assignee?.name ?? "Unassigned"} sub={assignee?.role} avatarColor={assignee?.color} />
                  {campaign && <MetaRow label="Campaign" value={campaign.title ?? campaign.name ?? "—"} dotColor={campaign.color} />}
                  {dept && <MetaRow label="Department" value={dept.name} />}
                  <MetaRow
                    label="Approval"
                    value={item.approval.status}
                    icon={item.approval.status === "APPROVED" || item.approval.status === "NOT_REQUIRED" ? CheckCircle2 : item.approval.status === "REJECTED" ? AlertCircle : Clock}
                  />
                </div>

                {/* Notes / Error */}
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
              </div>
            ) : (
              <ActivitySection item={item} users={users} onOpen={onEdit} />
            )}
          </div>
        </motion.div>
      </div>
    </ModalPortal>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-wider text-white/35">{label}</div>
  );
}

function MetaRow({ icon: Icon, label, value, sub, dotColor, avatarColor }: { icon?: any; label: string; value: string; sub?: string; dotColor?: string; avatarColor?: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
      <span className="flex items-center gap-2 text-[11px] text-white/45">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </span>
      <span className="flex items-center gap-1.5 text-right text-xs text-white">
        {avatarColor && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-[#0e0f17]" style={{ background: avatarColor }}>
            {avatar(value)}
          </span>
        )}
        {dotColor && <span className="h-2.5 w-2.5 rounded-full" style={{ background: dotColor }} />}
        <span className="flex flex-col">
          <span className="leading-tight">{value}</span>
          {sub && <span className="text-[10px] text-white/35">{sub}</span>}
        </span>
      </span>
    </div>
  );
}

function ActivitySection({ item, users, onOpen }: { item: ContentPlan; users: RefUser[]; onOpen: (i: ContentPlan) => void }) {
  const creator = users.find((u) => u.id === item.creatorId);
  const activities: PlanningActivity[] = [
    {
      id: `${item.id}-created`,
      type: "CREATED",
      contentId: item.id,
      contentTitle: item.title,
      actorName: creator?.name ?? "Unknown",
      at: item.createdAt,
      detail: "Content plan created",
    },
    {
      id: `${item.id}-updated`,
      type: "EDITED",
      contentId: item.id,
      contentTitle: item.title,
      actorName: creator?.name ?? "Unknown",
      at: item.updatedAt,
      detail: item.notes ?? "Last update",
    },
  ];

  return (
    <div className="space-y-3">
      <SectionLabel label="History" />
      <ActivityTimeline items={activities} />
      <button
        onClick={() => onOpen(item)}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/60 hover:text-white"
      >
        <ExternalLink className="h-3 w-3" />
        View full details
      </button>
    </div>
  );
}
