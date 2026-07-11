"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  addWeeks,
  addDays,
  format,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";
import type { ScheduledPost, ViewMode } from "@/types/scheduler";
import { PLATFORMS, STATUS_META } from "./platformMeta";
import { CalendarDays } from "lucide-react";

type Props = {
  posts: ScheduledPost[];
  view: ViewMode;
  anchor: Date;
  onAnchorChange: (d: Date) => void;
  onSelectPost: (post: ScheduledPost) => void;
};

const ACCENT_BAR: Record<string, string> = {
  red: "bg-red-400",
  sky: "bg-sky-400",
  violet: "bg-violet-400",
  emerald: "bg-emerald-400",
  amber: "bg-amber-400",
  rose: "bg-rose-400",
};

export default function SchedulerCalendar({
  posts,
  view,
  anchor,
  onAnchorChange,
  onSelectPost,
}: Props) {
  const byDay = (iso: string) =>
    posts.filter((p) => isSameDay(parseISO(p.scheduledAt), parseISO(iso)));

  if (view === "month") {
    const days = eachDayOfInterval({
      start: startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 }),
    });
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-white/40">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const inMonth = isSameMonth(day, anchor);
            const isCur = isSameDay(day, new Date());
            const dayPosts = posts.filter((p) => isSameDay(parseISO(p.scheduledAt), day));
            return (
              <button
                key={day.toISOString()}
                onClick={() => onAnchorChange(day)}
                className={`flex min-h-[78px] flex-col gap-1 rounded-xl border p-1.5 text-left transition ${
                  inMonth ? "border-white/10 bg-white/[0.03]" : "border-transparent bg-white/[0.01]"
                } ${isCur ? "border-red-500/40 shadow-[0_0_22px_rgba(248,113,113,0.18)]" : "hover:border-white/20"}`}
              >
                <span className={`text-[11px] font-semibold ${inMonth ? "text-white/80" : "text-white/30"}`}>
                  {format(day, "d")}
                </span>
                <div className="flex flex-col gap-1">
                  {dayPosts.slice(0, 3).map((p) => (
                    <EventChip key={p.id} post={p} onClick={() => onSelectPost(p)} />
                  ))}
                  {dayPosts.length > 3 && (
                    <span className="text-[9px] text-white/40">+{dayPosts.length - 3} more</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (view === "week") {
    const days = eachDayOfInterval({
      start: startOfWeek(anchor, { weekStartsOn: 1 }),
      end: endOfWeek(anchor, { weekStartsOn: 1 }),
    });
    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-7">
        {days.map((day) => {
          const dayPosts = posts.filter((p) => isSameDay(parseISO(p.scheduledAt), day));
          return (
            <div key={day.toISOString()} className="flex flex-col gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-2">
              <div className="text-center text-[11px] font-semibold text-white/70">
                {format(day, "EEE d")}
              </div>
              <div className="flex flex-col gap-1">
                {dayPosts.map((p) => (
                  <EventChip key={p.id} post={p} compact onClick={() => onSelectPost(p)} />
                ))}
                {dayPosts.length === 0 && (
                  <span className="py-3 text-center text-[10px] text-white/25">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // day view
  const dayPosts = posts
    .filter((p) => isSameDay(parseISO(p.scheduledAt), anchor))
    .sort((a, b) => +parseISO(a.scheduledAt) - +parseISO(b.scheduledAt));
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <CalendarDays className="h-4 w-4 text-red-300" />
        {format(anchor, "EEEE, dd MMMM yyyy")}
      </div>
      <div className="flex flex-col gap-2">
        {dayPosts.map((p) => (
          <EventChip key={p.id} post={p} wide onClick={() => onSelectPost(p)} />
        ))}
        {dayPosts.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 py-8 text-center text-sm text-white/40">
            No posts scheduled for this day.
          </div>
        )}
      </div>
    </div>
  );
}

function EventChip({
  post,
  onClick,
  compact,
  wide,
}: {
  post: ScheduledPost;
  onClick: () => void;
  compact?: boolean;
  wide?: boolean;
}) {
  const meta = PLATFORMS[post.platform];
  const Icon = meta.icon;
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-1.5 py-1 text-left transition hover:border-white/25 hover:bg-white/10 ${
        compact ? "text-[10px]" : "text-xs"
      } ${wide ? "w-full" : ""}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${ACCENT_BAR[post.accent]}`} />
      <Icon className={`h-3 w-3 shrink-0 ${meta.text}`} strokeWidth={2} />
      <span className="truncate text-white/80">{post.title}</span>
      {!compact && (
        <span className="ml-auto shrink-0 text-[10px] text-white/40">
          {format(parseISO(post.scheduledAt), "hh:mm a")}
        </span>
      )}
    </motion.button>
  );
}

export function calendarNav(
  view: ViewMode,
  anchor: Date,
  dir: -1 | 1
): Date {
  if (view === "month") return addMonths(anchor, dir);
  if (view === "week") return addWeeks(anchor, dir);
  return addDays(anchor, dir);
}

export function calendarLabel(view: ViewMode, anchor: Date): string {
  if (view === "month") return format(anchor, "MMMM yyyy");
  if (view === "week")
    return `Week of ${format(startOfWeek(anchor, { weekStartsOn: 1 }), "dd MMM")}`;
  return format(anchor, "dd MMM yyyy");
}

void STATUS_META; // reserved for future event tinting
