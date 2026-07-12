"use client";

import { useMemo, useState } from "react";
import type { ScheduledPost, PostStatus } from "@/types/scheduler";
import { posts as seed, deriveKpis } from "@/data/scheduler";
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

export default function SchedulerPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>(seed);
  const [view, setView] = useState<ViewMode>("month");
  const [anchor, setAnchor] = useState<Date>(new Date());
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduledPost | null>(null);
  const [selected, setSelected] = useState<ScheduledPost | null>(seed[0] ?? null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((p) => {
      if (platform !== "all" && p.platform !== platform) return false;
      if (status !== "all" && p.status !== (status as PostStatus)) return false;
      if (q) {
        const hay = `${p.title} ${p.caption} ${p.campaign ?? ""} ${p.hashtags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [posts, platform, status, search]);

  const kpis = useMemo(() => deriveKpis(posts), [posts]);

  const applySubmit = (
    incoming: ScheduledPost,
    _action: "draft" | "schedule" | "publish"
  ) => {
    setPosts((prev) => {
      const exists = prev.some((p) => p.id === incoming.id);
      return exists
        ? prev.map((p) => (p.id === incoming.id ? incoming : p))
        : [incoming, ...prev];
    });
    setModalOpen(false);
    setEditing(null);
    setSelected(incoming);
  };

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (post: ScheduledPost) => {
    setEditing(post);
    setModalOpen(true);
  };
  const duplicate = (post: ScheduledPost) => {
    const copy: ScheduledPost = {
      ...post,
      id: `s${Date.now()}`,
      title: `${post.title} (copy)`,
      status: "DRAFT",
    };
    setPosts((prev) => [copy, ...prev]);
    setSelected(copy);
  };
  const remove = (post: ScheduledPost) => {
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    if (selected?.id === post.id) setSelected(null);
  };
  const publishNow = (post: ScheduledPost) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, status: "PUBLISHING" as PostStatus } : p))
    );
    setSelected({ ...post, status: "PUBLISHING" });
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <SchedulerHeader onNewPost={openNew} />

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
