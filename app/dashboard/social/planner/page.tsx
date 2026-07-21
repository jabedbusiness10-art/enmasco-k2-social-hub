"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import type { ContentPlan, PlatformKey, ContentStatus, CalendarView, PlanningActivity } from "@/types/contentPlanner";
import PlannerHeader from "@/components/content-planner/PlannerHeader";
import PlannerStats from "@/components/content-planner/PlannerStats";
import PlannerToolbar from "@/components/content-planner/PlannerToolbar";
import FilterSidebar from "@/components/content-planner/FilterSidebar";
import CalendarArea from "@/components/content-planner/CalendarArea";
import ContentDrawer from "@/components/content-planner/ContentDrawer";
import AnalyticsPanel from "@/components/content-planner/AnalyticsPanel";
import ActivityTimeline from "@/components/content-planner/ActivityTimeline";
import PlanModal, { type PlanDraft } from "@/components/content-planner/PlanModal";
import FilterPanel from "@/components/content-planner/FilterPanel";

const PLATFORMS = [
  { key: "facebook", name: "Facebook", color: "#1877F2", short: "FB" },
  { key: "instagram", name: "Instagram", color: "#E1306C", short: "IG" },
  { key: "linkedin", name: "LinkedIn", color: "#0A66C2", short: "LI" },
  { key: "x", name: "X", color: "#1DA1F2", short: "X" },
  { key: "youtube", name: "YouTube", color: "#FF0000", short: "YT" },
  { key: "tiktok", name: "TikTok", color: "#00F2EA", short: "TT" },
] as const;

type Refs = { campaigns: any[]; users: any[]; departments: any[]; accounts: any[] };

// Map a server content-plan row (from /api/content-plans) into the client
// ContentPlan shape the presentational components expect. Real data only.
function toClientPlan(row: any): ContentPlan {
  return {
    id: row.id,
    title: row.title,
    caption: row.caption ?? "",
    platform: (row.platform ?? "facebook").toLowerCase() as PlatformKey,
    platforms: (row.platforms ?? []).map((p: any) => ({ id: p.id, platform: (p.platform ?? "facebook").toLowerCase(), accountId: p.accountId ?? null, status: p.status })),
    status: (row.workflowStatus ?? row.status ?? "DRAFT") as ContentStatus,
    schedule: {
      scheduledAt: row.scheduledAt ?? row.updatedAt,
      timezone: "Asia/Riyadh",
      recurrence: "NONE",
      publishedAt: row.status === "PUBLISHED" ? row.scheduledAt ?? undefined : undefined,
      failedReason: row.status === "FAILED" ? row.lastError ?? undefined : undefined,
    },
    approval: {
      status: row.approval?.status ?? "NOT_REQUIRED",
      requestedAt: undefined,
      decidedAt: row.approval?.reviewedAt,
      decidedBy: row.approval?.reviewedBy ?? undefined,
      note: row.approval?.comment ?? undefined,
    },
    campaignId: row.campaignId ?? undefined,
    departmentId: undefined,
    creatorId: row.creatorId,
    assigneeId: row.assigneeId ?? undefined,
    media: Array.isArray(row.media) ? row.media.map((m: any) => ({ id: m.id, type: m.type, url: m.url, thumbnail: m.thumbnail, alt: m.alt, order: m.order })) : (row.media ? [row.media] : []),
    hashtags: row.hashtags ?? [],
    notes: row.notes ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    category: row.category,
    priority: row.priority,
    labels: row.labels,
    assignee: row.assignee,
    creator: row.creator,
  } as ContentPlan;
}

function computeStats(items: ContentPlan[]) {
  const by = (s: string) => items.filter((i) => i.status === s).length;
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
  return {
    totalPlanned: items.length,
    scheduledToday: items.filter((i) => i.status === "SCHEDULED" && new Date(i.schedule.scheduledAt) >= startOfToday).length,
    drafts: by("DRAFT") + by("IDEA"),
    published: by("PUBLISHED"),
    pendingApproval: by("REVIEW") + by("APPROVED"),
    thisMonth: items.filter((i) => new Date(i.schedule.scheduledAt) >= startOfMonth).length,
  };
}

let idSeq = Date.now();
const nextId = () => `tmp${++idSeq}`;

export default function ContentPlannerPage() {
  const [items, setItems] = useState<ContentPlan[]>([]);
  const [refs, setRefs] = useState<Refs>({ campaigns: [], users: [], departments: [], accounts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<CalendarView>("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [search, setSearch] = useState("");
  const [selPlatforms, setSelPlatforms] = useState<PlatformKey[]>([]);
  const [selStatuses, setSelStatuses] = useState<ContentStatus[]>([]);
  const [departmentId, setDepartmentId] = useState<string | undefined>();
  const [campaignId, setCampaignId] = useState<string | undefined>();
  const [creatorId, setCreatorId] = useState<string | undefined>();
  const [dateFrom, setDateFrom] = useState<string | undefined>();
  const [dateTo, setDateTo] = useState<string | undefined>();
  const [filterOpen, setFilterOpen] = useState(false);

  const [drawerItem, setDrawerItem] = useState<ContentPlan | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<ContentPlan | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2200);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [plansRes, refsRes] = await Promise.all([
        fetch("/api/content-plans?includeArchived=true", { cache: "no-store" }),
        fetch("/api/content-plans/refs", { cache: "no-store" }),
      ]);
      if (!plansRes.ok) throw new Error((await plansRes.json()).error ?? "Failed to load plans");
      if (!refsRes.ok) throw new Error((await refsRes.json()).error ?? "Failed to load refs");
      const plansJson = await plansRes.json();
      const refsJson = await refsRes.json();
      setItems((plansJson.items ?? []).map(toClientPlan));
      setRefs({ campaigns: refsJson.campaigns ?? [], users: refsJson.users ?? [], departments: refsJson.departments ?? [], accounts: refsJson.accounts ?? [] });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const userById = (id?: string) => refs.users.find((u) => u.id === id);
  const campaignById = (id?: string) => refs.campaigns.find((c) => c.id === id);

  const stats = useMemo(() => computeStats(items), [items]);

  // Real activity feed derived from DB rows (recent updates), not mock fixtures.
  const planningActivity = useMemo(() => {
    const statusToType = (s: string | undefined): PlanningActivity["type"] => {
      switch ((s ?? "DRAFT").toUpperCase()) {
        case "DRAFT":
        case "IDEA":
          return "EDITED";
        case "SCHEDULED":
          return "SCHEDULED";
        case "PUBLISHING":
        case "PUBLISHED":
          return "PUBLISHED";
        case "APPROVED":
          return "APPROVED";
        case "REJECTED":
        case "FAILED":
          return "FAILED";
        case "ARCHIVED":
          return "FAILED";
        default:
          return "EDITED";
      }
    };
    return [...items]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 12)
      .map((i) => ({
        id: i.id,
        type: statusToType(i.status),
        contentId: i.id,
        contentTitle: i.title,
        actorName: userById(i.creatorId)?.name ?? "Team",
        at: i.updatedAt,
        detail: i.notes ?? undefined,
      }));
  }, [items, refs.users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (selPlatforms.length && !selPlatforms.includes(i.platform)) return false;
      if (selStatuses.length && !selStatuses.includes(i.status)) return false;
      if (campaignId && i.campaignId !== campaignId) return false;
      if (creatorId && i.creatorId !== creatorId) return false;
      const d = new Date(i.schedule.scheduledAt);
      if (dateFrom && d < new Date(dateFrom)) return false;
      if (dateTo && d > new Date(dateTo + "T23:59:59")) return false;
      if (q) {
        const hay = `${i.title} ${i.caption} ${(i.hashtags ?? []).join(" ")} ${userById(i.creatorId)?.name ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, selPlatforms, selStatuses, campaignId, creatorId, dateFrom, dateTo, search, refs.users]);

  const filtersActive =
    selPlatforms.length > 0 || selStatuses.length > 0 || !!campaignId || !!creatorId || !!dateFrom || !!dateTo || !!search;

  const togglePlatform = (k: PlatformKey) =>
    setSelPlatforms((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  const toggleStatus = (s: ContentStatus) =>
    setSelStatuses((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const clearFilters = () => {
    setSelPlatforms([]);
    setSelStatuses([]);
    setCampaignId(undefined);
    setCreatorId(undefined);
    setDateFrom(undefined);
    setDateTo(undefined);
    setSearch("");
  };

  const openCreate = () => {
    setModalInitial(null);
    setModalOpen(true);
  };
  const openEdit = (i: ContentPlan) => {
    setModalInitial(i);
    setModalOpen(true);
  };

  const savePlan = async (draft: PlanDraft) => {
    const selectedAccounts = (draft.platforms ?? []).map((p) => p.accountId).filter(Boolean) as string[];
    const payload = {
      title: draft.title,
      caption: draft.caption,
      platforms: (draft.platforms ?? []).map((p) => p.platform),
      accountIds: selectedAccounts,
      workflowStatus: draft.status,
      status: draft.status,
      campaignId: draft.campaignId || null,
      creatorId: draft.creatorId,
      assigneeId: draft.assigneeId || null,
      hashtags: draft.hashtags ?? [],
      notes: draft.notes,
      scheduledAt: draft.scheduledAt,
      mediaAttachments: draft.media?.map((m) => ({ type: m.type, url: m.url, thumbnail: m.thumbnail, alt: m.alt, order: m.order })) ?? [],
    };
    try {
      if (draft.id) {
        const res = await fetch(`/api/content-plans/${draft.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error((await res.json()).error ?? "Update failed");
        flash("Content updated");
      } else {
        const res = await fetch(`/api/content-plans`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error((await res.json()).error ?? "Create failed");
        flash("Content created");
      }
      setModalOpen(false);
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const duplicate = async (i: ContentPlan) => {
    try {
      const res = await fetch(`/api/content-plans/${i.id}`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Duplicate failed");
      flash("Duplicated");
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const del = async (i: ContentPlan) => {
    try {
      const res = await fetch(`/api/content-plans/${i.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Delete failed");
      setDrawerItem(null);
      flash("Moved to trash");
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const publishNow = async (i: ContentPlan) => {
    try {
      const res = await fetch(`/api/publishing/publish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId: i.id }) });
      if (!res.ok) throw new Error((await res.json()).error ?? "Publish failed");
      flash("Published now");
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const exportSchedule = () => {
    const rows = items.map((i) => ({
      title: i.title,
      platform: i.platform,
      status: i.status,
      scheduledAt: i.schedule.scheduledAt,
      campaign: campaignById(i.campaignId)?.title ?? "",
      creator: userById(i.creatorId)?.name ?? "",
    }));
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "enmasco-content-schedule.json";
    a.click();
    URL.revokeObjectURL(url);
    flash("Schedule exported");
  };

  const importCalendar = () => {
    flash("Calendar import — connect an external provider to enable");
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <PlannerHeader onCreate={() => openCreate()} onImport={importCalendar} onExport={exportSchedule} />
      {error && (
        <div className="mx-4 mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-300">{error}</div>
      )}
      <PlannerStats stats={stats} />
      <PlannerToolbar
        view={view}
        onView={setView}
        search={search}
        onSearch={setSearch}
        onOpenFilters={() => setFilterOpen(true)}
        filtersActive={filtersActive}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="hidden shrink-0 overflow-y-auto lg:block lg:w-[200px]">
          <FilterSidebar
            platforms={PLATFORMS as any}
            selectedPlatforms={selPlatforms}
            selectedStatuses={selStatuses}
            onTogglePlatform={togglePlatform}
            onToggleStatus={toggleStatus}
          />
        </div>

        <div className="flex min-h-[280px] flex-1 flex-col">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-xs text-white/40">Loading planner…</div>
          ) : items.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 text-center">
              <p className="text-sm font-medium text-white/70">No content created yet.</p>
              <p className="text-xs text-white/45">Create your first planned post to populate the editorial calendar.</p>
              <button onClick={openCreate} className="mt-2 rounded-lg bg-indigo-500/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500">Create your first planned post</button>
            </div>
          ) : (
            <CalendarArea
              view={view}
              items={filtered}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onPick={(i) => setDrawerItem(i)}
              onCreate={openCreate}
            />
          )}
        </div>

        <div className="hidden shrink-0 overflow-y-auto xl:block xl:w-[300px]">
          <AnalyticsPanel items={items} activity={planningActivity} onOpen={(i) => setDrawerItem(i)} />
        </div>
      </div>

      <div className="max-h-[180px] shrink-0 overflow-y-auto">
        <ActivityTimeline items={planningActivity} />
      </div>

      <ContentDrawer
        item={drawerItem}
        users={refs.users as any}
        campaigns={refs.campaigns as any}
        onClose={() => setDrawerItem(null)}
        onEdit={openEdit}
        onDuplicate={duplicate}
        onMove={(i) => { setDrawerItem(null); flash(`Move “${i.title}” — pick a date in the calendar`); }}
        onDelete={del}
        onPublishNow={publishNow}
        onApprove={async (decision, note) => {
          if (!drawerItem) return;
          try {
            const res = await fetch(`/api/content-plans/${drawerItem.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision, comment: note }) });
            if (!res.ok) throw new Error((await res.json()).error ?? "Approval failed");
            flash(decision === "APPROVED" ? "Approved" : "Rejected");
            await load();
          } catch (e: any) {
            setError(e.message);
          }
        }}
      />
      {modalOpen && (
        <PlanModal
          initial={modalInitial as any}
          users={refs.users as any}
          campaigns={refs.campaigns as any}
          departments={refs.departments as any}
          accounts={refs.accounts as any}
          onClose={() => setModalOpen(false)}
          onSave={savePlan}
        />
      )}
      <FilterPanel
        platforms={PLATFORMS as any}
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        selPlatforms={selPlatforms}
        selStatuses={selStatuses}
        departmentId={undefined}
        campaignId={campaignId}
        creatorId={creatorId}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onTogglePlatform={togglePlatform}
        onToggleStatus={toggleStatus}
        setDepartment={() => {}}
        setCampaign={setCampaignId}
        setCreator={setCreatorId}
        setDateFrom={setDateFrom}
        setDateTo={setDateTo}
        onClear={clearFilters}
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 text-xs font-medium text-emerald-100 shadow-2xl backdrop-blur-xl">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}
    </div>
  );
}
