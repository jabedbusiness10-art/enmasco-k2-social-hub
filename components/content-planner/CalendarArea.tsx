"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ContentPlan, CalendarView } from "@/types/contentPlanner";
import ContentCard from "./ContentCard";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function startOfWeek(d: Date) {
  const n = new Date(d);
  n.setDate(n.getDate() - n.getDay());
  return n;
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function fmtDayHeading(d: Date) {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
function fmtMonthHeading(d: Date) {
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function CalendarArea({
  view,
  items,
  selectedDate,
  onSelectDate,
  onPick,
  onCreate,
}: {
  view: CalendarView;
  items: ContentPlan[];
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  onPick: (item: ContentPlan) => void;
  onCreate: (d?: Date) => void;
}) {
  const [cursor, setCursor] = useState(startOfDay(selectedDate));

  const shift = (delta: number) => {
    const n = new Date(cursor);
    if (view === "month") n.setMonth(n.getMonth() + delta);
    else if (view === "week") n.setDate(n.getDate() + delta * 7);
    else if (view === "day") n.setDate(n.getDate() + delta);
    else n.setMonth(n.getMonth() + delta);
    setCursor(n);
  };

  const heading =
    view === "day"
      ? fmtDayHeading(cursor)
      : view === "week"
        ? `Week of ${fmtDayHeading(startOfWeek(cursor))}`
        : fmtMonthHeading(cursor);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => shift(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:text-white"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => shift(1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:text-white"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => { const t = new Date(); setCursor(startOfDay(t)); onSelectDate(t); }}
            className="ml-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-white/70 transition hover:text-white"
          >
            Today
          </button>
          <h2 className="ml-3 text-sm font-semibold tracking-tight text-white">{heading}</h2>
        </div>
        <button
          onClick={() => onCreate(cursor)}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:shadow-md"
        >
          New
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {view === "month" && (
          <MonthGrid cursor={cursor} items={items} onPick={onPick} onSelectDate={onSelectDate} />
        )}
        {view === "week" && (
          <WeekGrid cursor={cursor} items={items} onPick={onPick} onSelectDate={onSelectDate} />
        )}
        {view === "day" && <DayList day={cursor} items={items} onPick={onPick} />}
        {view === "agenda" && <AgendaList items={items} onPick={onPick} />}
      </div>
    </div>
  );
}

function MonthGrid({
  cursor,
  items,
  onPick,
  onSelectDate,
}: {
  cursor: Date;
  items: ContentPlan[];
  onPick: (i: ContentPlan) => void;
  onSelectDate: (d: Date) => void;
}) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const today = startOfDay(new Date());

  const cells: Date[] = [];
  for (let i = 0; i < startPad; i++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), 1 - (startPad - i)));
  for (let i = 1; i <= daysInMonth; i++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), i));
  while (cells.length % 7 !== 0) cells.push(new Date(cursor.getFullYear(), cursor.getMonth() + 1, cells.length - (startPad + daysInMonth) + 1));

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {WEEKDAYS.map((w) => (
        <div key={w} className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-white/35">{w}</div>
      ))}
      {cells.map((d, idx) => {
        const inMonth = d.getMonth() === cursor.getMonth();
        const isToday = sameDay(d, today);
        const dayItems = items.filter((i) => sameDay(new Date(i.schedule.scheduledAt), d));
        return (
          <div
            key={idx}
            onClick={() => onSelectDate(d)}
            className={`min-h-[84px] cursor-pointer rounded-lg border p-1.5 transition ${
              isToday ? "border-sky-400/40 bg-sky-400/5" : "border-white/5 bg-white/[0.02] hover:bg-white/5"
            } ${inMonth ? "" : "opacity-40"}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") onSelectDate(d); }}
          >
            <div className={`text-[11px] font-semibold leading-tight ${isToday ? "text-sky-300" : "text-white/50"}`}>{d.getDate()}</div>
            <div className="mt-1 space-y-1">
              {dayItems.slice(0, 3).map((i) => (
                <ContentCard key={i.id} item={i} compact onClick={() => onPick(i)} />
              ))}
              {dayItems.length > 3 && (
                <div className="px-1 text-[9px] font-medium text-white/40">+{dayItems.length - 3} more</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WeekGrid({
  cursor,
  items,
  onPick,
  onSelectDate,
}: {
  cursor: Date;
  items: ContentPlan[];
  onPick: (i: ContentPlan) => void;
  onSelectDate: (d: Date) => void;
}) {
  const start = startOfWeek(cursor);
  const days = Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  const today = startOfDay(new Date());

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((d) => {
        const isToday = sameDay(d, today);
        const dayItems = items.filter((i) => sameDay(new Date(i.schedule.scheduledAt), d));
        return (
          <div
            key={d.toISOString()}
            onClick={() => onSelectDate(d)}
            className={`min-h-[240px] cursor-pointer rounded-lg border p-1.5 transition ${
              isToday ? "border-sky-400/40 bg-sky-400/5" : "border-white/5 bg-white/[0.02] hover:bg-white/5"
            }`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") onSelectDate(d); }}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className={`text-[10px] font-semibold ${isToday ? "text-sky-300" : "text-white/50"}`}>{WEEKDAYS[d.getDay()]}</span>
              <span className={`text-[10px] font-semibold ${isToday ? "text-sky-300" : "text-white/40"}`}>{d.getDate()}</span>
            </div>
            <div className="space-y-1">
              {dayItems.map((i) => (
                <ContentCard key={i.id} item={i} compact onClick={() => onPick(i)} />
              ))}
              {dayItems.length === 0 && <div className="py-3 text-center text-[9px] text-white/20">—</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayList({ day, items, onPick }: { day: Date; items: ContentPlan[]; onPick: (i: ContentPlan) => void }) {
  const dayItems = items
    .filter((i) => sameDay(new Date(i.schedule.scheduledAt), day))
    .sort((a, b) => new Date(a.schedule.scheduledAt).getTime() - new Date(b.schedule.scheduledAt).getTime());

  return (
    <div className="space-y-2">
      {dayItems.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-12">
          <div className="text-2xl font-light text-white/20">{fmtDayHeading(day)}</div>
          <div className="text-xs text-white/35">No content planned for this day.</div>
        </div>
      )}
      {dayItems.map((i) => (
        <div
          key={i.id}
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 transition hover:bg-white/[0.06]"
        >
          <div className="w-12 shrink-0 text-center text-xs font-semibold text-white/70">{fmtTime(i.schedule.scheduledAt)}</div>
          <div className="min-w-0 flex-1">
            <ContentCard item={i} onClick={() => onPick(i)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function AgendaList({ items, onPick }: { items: ContentPlan[]; onPick: (i: ContentPlan) => void }) {
  const sorted = [...items].sort((a, b) => new Date(a.schedule.scheduledAt).getTime() - new Date(b.schedule.scheduledAt).getTime());

  return (
    <div className="space-y-1.5">
      {sorted.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-white/35">
          <div className="text-xs">No upcoming content.</div>
        </div>
      )}
      {sorted.map((i) => (
        <div
          key={i.id}
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 transition hover:bg-white/[0.06]"
        >
          <div className="w-28 shrink-0 text-[11px] text-white/50">
            {new Date(i.schedule.scheduledAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="min-w-0 flex-1">
            <ContentCard item={i} onClick={() => onPick(i)} />
          </div>
        </div>
      ))}
    </div>
  );
}
