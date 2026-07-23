"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ScheduledPost, PostStatus } from "@/types/scheduler";
import SchedulerHeader from "@/components/scheduler/SchedulerHeader";
import SchedulerStats from "@/components/scheduler/SchedulerStats";
import SchedulerToolbar, {
  type PlatformFilter,
  type StatusFilter,
} from "@/components/scheduler/SchedulerToolbar";
import SchedulerCalendar, {
  calendarNav,
  calendarLabel,
} from "@/components/scheduler/SchedulerCalendar";
import UpcomingPosts from "@/components/scheduler/UpcomingPosts";
import ScheduleModal from "@/components/scheduler/ScheduleModal";
import PostDetailsDrawer from "@/components/scheduler/PostDetailsDrawer";
import type { ViewMode } from "@/types/scheduler";

function toView(p: any): ScheduledPost {
  const platformMap: Record<string, any> = {
    FACEBOOK: "facebook",
    INSTAGRAM: "instagram",
    LINKEDIN: "linkedin",
    X: "x",
    YOUTUBE: "youtube",
    WEBSITE: "website",
  };
  const statusMap: Record<string, PostStatus> = {
    DRAFT: "DRAFT",
    SCHEDULED: "SCHEDULED",
    QUEUED: "QUEUED",
    PUBLISHING: "PUBLISHING",
    PUBLISHED: "PUBLISHED",
    FAILED: "FAILED",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    CANCELLED: "CANCELLED",
    PENDING_APPROVAL: "PENDING_APPROVAL",
    RETRYING: "RETRYING",
  };
  return {
    id: p.id,
    title: p.title ?? "(untitled)",
    caption: p.content ?? "",
    platform: platformMap[p.platform] ?? "facebook",
    mediaUrl: p.media?.[0]?.url,
    hashtags: p.hashtags ?? [],
    scheduledAt: p.scheduled?.scheduledAt ?? p.publishedAt ?? p.createdAt,
    status: statusMap[p.status] ?? "DRAFT",
    owner: p.creator?.name ?? p.createdById ?? "system",
    timezone: "Asia/Riyadh",
    accent: "red",
  };
}

export default function SchedulerPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("month");
  const [anchor, setAnchor] = useState<Date>(new Date());
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduledPost | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2200);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/publishing/create", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load");
      setPosts((json.posts ?? []).map(toView));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const kpis = useMemo(() => deriveKpis(posts), [posts]);

  const applySubmit = async (
    incoming: ScheduledPost,
    _action: "draft" | "schedule" | "publish",
  ) => {
    try {
      const platforms = [
        { platform: "FACEBOOK", accountId: "" },
        { platform: "INSTAGRAM", accountId: "" },
        { platform: "LINKEDIN", accountId: "" },
      ].filter((p) => matchPlatform(incoming.platform, p.platform));
      const res = await fetch("/api/publishing/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: incoming.title,
          caption: incoming.caption,
          hashtags: incoming.hashtags,
          mediaUrls: incoming.mediaUrl && /^https?:\/\//i.test(incoming.mediaUrl)
            ? [incoming.mediaUrl]
            : [],
          platforms,
          scheduledAt: _action === "schedule" ? incoming.scheduledAt : undefined,
          timezone: incoming.timezone,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        const fieldErrors = json.issues?.fieldErrors
          ? Object.values(json.issues.fieldErrors).flat().filter(Boolean).join(" ")
          : "";
        throw new Error(fieldErrors || json.error || "Create failed");
      }
      await load();
      if (_action === "publish" && json.post?.id) {
        await publishNowById(json.post.id);
      }
      flash(_action === "publish" ? "Published" : "Saved");
    } catch (e: any) {
      setError(e.message);
    }
    setModalOpen(false);
    setEditing(null);
  };

  function matchPlatform(view: string, api: string): boolean {
    const m: Record<string, string> = { facebook: "FACEBOOK", instagram: "INSTAGRAM", linkedin: "LINKEDIN" };
    return m[view] === api;
  }

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (post: ScheduledPost) => {
    setSelectedId(null);
    setEditing(post);
    setModalOpen(true);
  };
  const openEditById = (id: string) => {
    const p = posts.find((x) => x.id === id);
    if (p) openEdit(p);
  };
  const openDetails = (post: ScheduledPost) => setSelectedId(post.id);

  const duplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/publishing/duplicate/${id}`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Duplicate failed");
      flash("Duplicated as Draft");
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  };
  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/publishing/update/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Delete failed");
      if (selectedId === id) setSelectedId(null);
      flash("Deleted");
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  };
  const publishNowById = async (id: string) => {
    try {
      const res = await fetch(`/api/publishing/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Publish failed");
      flash("Published");
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  };
  const retryById = async (id: string) => {
    try {
      const res = await fetch(`/api/publishing/retry/${id}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Retry failed");
      flash("Retry dispatched");
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  };
  const cancelById = async (id: string) => {
    try {
      const res = await fetch(`/api/publishing/cancel/${id}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Cancel failed");
      flash("Schedule cancelled");
      setSelectedId(null);
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Real drag-and-drop reschedule (server source of truth).
  const reschedule = async (id: string, newIso: string) => {
    const prev = posts.find((p) => p.id === id);
    // Optimistic update
    setPosts((prevPosts) => prevPosts.map((p) => (p.id === id ? { ...p, scheduledAt: newIso } : p)));
    try {
      const res = await fetch(`/api/publishing/reschedule/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: newIso }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Reschedule failed");
      flash("Rescheduled");
      await load();
    } catch (e: any) {
      // Rollback on failure
      if (prev) setPosts((prevPosts) => prevPosts.map((p) => (p.id === id ? prev : p)));
      setError(e.message);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((p) => {
      if (platform !== "all" && p.platform !== platform) return false;
      if (status !== "all" && p.status !== (status as PostStatus)) return false;
      if (q) {
        const hay = `${p.title} ${p.caption} ${p.hashtags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [posts, platform, status, search]);

  return (
    <div className="flex h-full flex-col">
      <SchedulerHeader onNewPost={openNew} />

      {error && (
        <div className="mx-4 mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-300">{error}</div>
      )}

      <div className="mt-4 flex flex-col gap-4 overflow-y-auto px-4 pb-6">
        <SchedulerStats items={kpis} />

        <SchedulerToolbar
          view={view}
          onViewChange={setView}
          platform={platform}
          onPlatformChange={setPlatform}
          status={status}
          onStatusChange={setStatus}
          search={search}
          onSearchChange={setSearch}
          dateLabel={calendarLabel(view, anchor)}
          onPrev={() => setAnchor((a) => calendarNav(view, a, -1))}
          onNext={() => setAnchor((a) => calendarNav(view, a, 1))}
          onToday={() => setAnchor(new Date())}
          onNewPost={openNew}
        />

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
          <div className="flex flex-col gap-4">
            <SchedulerCalendar
              posts={filtered}
              view={view}
              anchor={anchor}
              onAnchorChange={setAnchor}
              onSelectPost={openDetails}
              onReschedule={reschedule}
            />
            <UpcomingPosts
              posts={filtered}
              onEdit={openEdit}
              onDuplicate={(p) => duplicate(p.id)}
              onDelete={(p) => remove(p.id)}
              onPublishNow={(p) => publishNowById(p.id)}
              onClick={openDetails}
            />
          </div>

          <aside className="flex flex-col gap-4">
            {selectedId ? (
              <PostDetailsDrawer
                postId={selectedId}
                onClose={() => setSelectedId(null)}
                onEdit={openEditById}
                onDuplicate={duplicate}
                onDelete={remove}
                onPublish={publishNowById}
                onRetry={retryById}
                onCancel={cancelById}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/50">
                Select a post or calendar event to preview its details.
              </div>
            )}
          </aside>
        </section>
      </div>

      <ScheduleModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        initial={editing}
        onSubmit={applySubmit}
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 text-xs font-medium text-emerald-100 shadow-2xl backdrop-blur-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

// local KPI derivation
function deriveKpis(posts: ScheduledPost[]) {
  const total = posts.length;
  const published = posts.filter((p) => p.status === "PUBLISHED").length;
  const scheduled = posts.filter((p) => p.status === "SCHEDULED").length;
  const failed = posts.filter((p) => p.status === "FAILED").length;
  const cancelled = posts.filter((p) => p.status === "CANCELLED").length;
  return [
    { label: "Total", value: String(total) },
    { label: "Scheduled", value: String(scheduled) },
    { label: "Published", value: String(published) },
    { label: "Failed", value: String(failed) },
    { label: "Cancelled", value: String(cancelled) },
  ];
}
