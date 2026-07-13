"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import type { ContentPlan, PlatformKey, ContentStatus, CalendarView } from "@/types/contentPlanner";
import { contentPlans as seed, platforms, campaigns, departments, users, planningActivity, computeStats, userById } from "@/data/contentPlanner";
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

let idSeq = 1000;
const nextId = () => `cp${++idSeq}`;

export default function ContentPlannerPage() {
  const [items, setItems] = useState<ContentPlan[]>(seed);
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

  const stats = useMemo(() => computeStats(items), [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (selPlatforms.length && !selPlatforms.includes(i.platform)) return false;
      if (selStatuses.length && !selStatuses.includes(i.status)) return false;
      if (departmentId && i.departmentId !== departmentId) return false;
      if (campaignId && i.campaignId !== campaignId) return false;
      if (creatorId && i.creatorId !== creatorId) return false;
      const d = new Date(i.schedule.scheduledAt);
      if (dateFrom && d < new Date(dateFrom)) return false;
      if (dateTo && d > new Date(dateTo + "T23:59:59")) return false;
      if (q) {
        const hay = `${i.title} ${i.caption} ${i.hashtags.join(" ")} ${userById(i.creatorId)?.name ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, selPlatforms, selStatuses, departmentId, campaignId, creatorId, dateFrom, dateTo, search]);

  const filtersActive =
    selPlatforms.length > 0 || selStatuses.length > 0 || !!departmentId || !!campaignId || !!creatorId || !!dateFrom || !!dateTo || !!search;

  const togglePlatform = (k: PlatformKey) =>
    setSelPlatforms((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  const toggleStatus = (s: ContentStatus) =>
    setSelStatuses((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const clearFilters = () => {
    setSelPlatforms([]);
    setSelStatuses([]);
    setDepartmentId(undefined);
    setCampaignId(undefined);
    setCreatorId(undefined);
    setDateFrom(undefined);
    setDateTo(undefined);
    setSearch("");
  };

  const openCreate = (d?: Date) => {
    setModalInitial(null);
    if (d) {
      // pre-fill schedule date silently via a transient create
    }
    setModalOpen(true);
  };
  const openEdit = (i: ContentPlan) => {
    setModalInitial(i);
    setModalOpen(true);
  };

  const savePlan = (draft: PlanDraft) => {
    const now = new Date().toISOString();
    if (draft.id) {
      setItems((prev) =>
        prev.map((i): ContentPlan =>
          i.id === draft.id
            ? {
                ...i,
                title: draft.title,
                caption: draft.caption,
                platform: draft.platform,
                status: draft.status,
                schedule: { ...i.schedule, scheduledAt: draft.scheduledAt },
                campaignId: draft.campaignId,
                departmentId: draft.departmentId,
                creatorId: draft.creatorId,
                assigneeId: draft.assigneeId,
                hashtags: draft.hashtags,
                notes: draft.notes,
                updatedAt: now,
              }
            : i,
        ),
      );
      flash("Content updated");
    } else {
      const newItem: ContentPlan = {
        id: nextId(),
        title: draft.title,
        caption: draft.caption,
        platform: draft.platform,
        status: draft.status,
        schedule: { scheduledAt: draft.scheduledAt, timezone: "Asia/Dhaka", recurrence: "NONE" },
        approval: { status: draft.status === "DRAFT" ? "PENDING" : "NOT_REQUIRED" },
        campaignId: draft.campaignId,
        departmentId: draft.departmentId,
        creatorId: draft.creatorId,
        assigneeId: draft.assigneeId,
        hashtags: draft.hashtags,
        notes: draft.notes,
        createdAt: now,
        updatedAt: now,
      };
      setItems((prev) => [newItem, ...prev]);
      flash("Content created");
    }
    setModalOpen(false);
  };

  const duplicate = (i: ContentPlan) => {
    const copy: ContentPlan = { ...i, id: nextId(), title: `${i.title} (copy)`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), performance: undefined };
    setItems((prev) => [copy, ...prev]);
    setDrawerItem(copy);
    flash("Duplicated");
  };

  const move = (i: ContentPlan) => {
    flash(`Move “${i.title}” — select a date in the calendar`);
    setDrawerItem(null);
  };

  const del = (i: ContentPlan) => {
    setItems((prev) => prev.filter((x) => x.id !== i.id));
    setDrawerItem(null);
    flash("Moved to trash");
  };

  const publishNow = (i: ContentPlan) => {
    setItems((prev) =>
      prev.map((x) =>
        x.id === i.id
          ? { ...x, status: "PUBLISHED", schedule: { ...x.schedule, publishedAt: new Date().toISOString() }, updatedAt: new Date().toISOString() }
          : x,
      ),
    );
    setDrawerItem((prev) => (prev && prev.id === i.id ? { ...prev, status: "PUBLISHED" } : prev));
    flash("Published now");
  };

  const exportSchedule = () => {
    const rows = items.map((i) => ({
      title: i.title,
      platform: i.platform,
      status: i.status,
      scheduledAt: i.schedule.scheduledAt,
      campaign: campaigns.find((c) => c.id === i.campaignId)?.name ?? "",
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
        {/* Left filters */}
        <div className="hidden shrink-0 overflow-y-auto lg:block lg:w-[200px]">
          <FilterSidebar
            platforms={platforms}
            selectedPlatforms={selPlatforms}
            selectedStatuses={selStatuses}
            onTogglePlatform={togglePlatform}
            onToggleStatus={toggleStatus}
          />
        </div>

        {/* Calendar — primary content area, always fills available height */}
        <div className="flex min-h-[280px] flex-1 flex-col">
          <CalendarArea
            view={view}
            items={filtered}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onPick={(i) => setDrawerItem(i)}
            onCreate={openCreate}
          />
        </div>

        {/* Right analytics */}
        <div className="hidden shrink-0 overflow-y-auto xl:block xl:w-[300px]">
          <AnalyticsPanel items={items} activity={planningActivity} onOpen={(i) => setDrawerItem(i)} />
        </div>
      </div>

      {/* Bottom timeline — bounded so it never steals the calendar's height */}
      <div className="max-h-[180px] shrink-0 overflow-y-auto">
        <ActivityTimeline items={planningActivity} />
      </div>

      {/* Overlays */}
      <ContentDrawer
        item={drawerItem}
        onClose={() => setDrawerItem(null)}
        onEdit={openEdit}
        onDuplicate={duplicate}
        onMove={move}
        onDelete={del}
        onPublishNow={publishNow}
      />
      {modalOpen && (
        <PlanModal initial={modalInitial} onClose={() => setModalOpen(false)} onSave={savePlan} />
      )}
      <FilterPanel
        platforms={platforms}
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        selPlatforms={selPlatforms}
        selStatuses={selStatuses}
        departmentId={departmentId}
        campaignId={campaignId}
        creatorId={creatorId}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onTogglePlatform={togglePlatform}
        onToggleStatus={toggleStatus}
        setDepartment={setDepartmentId}
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
