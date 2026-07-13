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
import PostPreview from "@/components/scheduler/PostPreview";
import ScheduleModal from "@/components/scheduler/ScheduleModal";
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
    QUEUED: "SCHEDULED",
    PUBLISHING: "PUBLISHING",
    PUBLISHED: "PUBLISHED",
    FAILED: "FAILED",
    REJECTED: "FAILED",
    CANCELLED: "CANCELLED",
  };
  return {
    id: p.id,
    title: p.title ?? "(untitled)",
    caption: p.caption,
    platform: platformMap[p.platform] ?? "facebook",
    mediaUrl: p.media?.[0]?.url,
    hashtags: p.hashtags ?? [],
    scheduledAt: p.publishedAt ?? p.createdAt,
    status: statusMap[p.status] ?? "DRAFT",
    owner: p.createdById ?? "system",
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
  const [selected, setSelected] = useState<ScheduledPost | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          mediaUrls: incoming.mediaUrl ? [incoming.mediaUrl] : [],
          platforms,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Create failed");
      await load();
      if (_action === "publish" && json.post?.id) {
        await publishNowById(json.post.id);
      }
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
    setEditing(post);
    setModalOpen(true);
  };
  const duplicate = (post: ScheduledPost) => {
    setPosts((prev) => [{ ...post, id: `s${Date.now()}`, title: `${post.title} (copy)`, status: "DRAFT" }, ...prev]);
  };
  const remove = async (post: ScheduledPost) => {
    await fetch(`/api/publishing/update/${post.id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    if (selected?.id === post.id) setSelected(null);
  };
  const publishNowById = async (id: string) => {
    try {
      const res = await fetch("/api/publishing/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Publish failed");
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  };
  const publishNow = (post: ScheduledPost) => {
    publishNowById(post.id);
    setSelected({ ...post, status: "PUBLISHING" });
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
              onSelectPost={(p) => setSelected(p)}
            />
            <UpcomingPosts
              posts={filtered}
              onEdit={openEdit}
              onDuplicate={duplicate}
              onDelete={remove}
              onPublishNow={publishNow}
              onClick={(p) => setSelected(p)}
            />
          </div>

          <aside className="flex flex-col gap-4">
            <PostPreview post={selected} />
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
    </div>
  );
}

// local KPI derivation (kept from previous module)
function deriveKpis(posts: ScheduledPost[]) {
  const total = posts.length;
  const published = posts.filter((p) => p.status === "PUBLISHED").length;
  const scheduled = posts.filter((p) => p.status === "SCHEDULED").length;
  const failed = posts.filter((p) => p.status === "FAILED").length;
  return [
    { label: "Total", value: String(total) },
    { label: "Published", value: String(published) },
    { label: "Scheduled", value: String(scheduled) },
    { label: "Failed", value: String(failed) },
  ];
}
