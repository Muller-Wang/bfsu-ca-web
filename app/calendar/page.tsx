"use client";

import { useState } from "react";
import clsx from "clsx";
import { EVENTS } from "@/lib/mock/data";
import { EVENT_TAG_META, type CalendarEvent } from "@/lib/types";
import { findUser } from "@/lib/mock/users";

const WEEKDAYS_EN = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function getMonthGrid(year: number, month: number) {
  // month is 0-indexed
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  // Monday-first column
  const firstWeekday = (first.getDay() + 6) % 7;
  const days: { date: Date; outside: boolean }[] = [];

  for (let i = firstWeekday; i > 0; i--) {
    const d = new Date(year, month, 1 - i);
    days.push({ date: d, outside: true });
  }
  for (let d = 1; d <= last.getDate(); d++) {
    days.push({ date: new Date(year, month, d), outside: false });
  }
  while (days.length < 42) {
    const last = days[days.length - 1].date;
    const nxt = new Date(last);
    nxt.setDate(nxt.getDate() + 1);
    days.push({ date: nxt, outside: true });
  }
  return days;
}

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function CalendarPage() {
  const [cursor, setCursor] = useState({ y: 2026, m: 4 }); // May 2026 (0-indexed)
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const today = fmt(new Date("2026-05-21"));

  const days = getMonthGrid(cursor.y, cursor.m);
  const monthName = new Date(cursor.y, cursor.m, 1).toLocaleDateString("en-US", { month: "long" }).toUpperCase();

  const prev = () => {
    setCursor((c) => {
      const nm = c.m - 1;
      return nm < 0 ? { y: c.y - 1, m: 11 } : { ...c, m: nm };
    });
  };
  const next = () => {
    setCursor((c) => {
      const nm = c.m + 1;
      return nm > 11 ? { y: c.y + 1, m: 0 } : { ...c, m: nm };
    });
  };

  return (
    <div className="px-10 py-10 max-w-6xl">
      {/* Header */}
      <div className="rise rise-1 flex items-end justify-between mb-2">
        <div>
          <div className="meta">CALENDAR · 日历</div>
          <h1 className="display text-4xl mt-2 flex items-baseline gap-4">
            <button onClick={prev} className="text-ink-soft hover:text-accent">◀</button>
            <span>
              {cursor.y} <span className="italic">/</span> {monthName}
            </span>
            <button onClick={next} className="text-ink-soft hover:text-accent">▶</button>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border rule">
            {["月", "周", "列表"].map((v, i) => (
              <button
                key={v}
                className={clsx(
                  "px-3 py-1.5 text-sm",
                  i === 0 ? "bg-ink text-card" : "hover:bg-card"
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <button className="px-4 py-2 text-sm bg-accent text-card hover:bg-accent-soft transition-colors">
            + 新建
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="rise rise-2 flex items-center gap-5 mt-6 mb-6">
        {Object.entries(EVENT_TAG_META).map(([key, meta]) => (
          <span key={key} className="flex items-center gap-2 meta">
            <span className="dot" style={{ color: meta.color }} />
            {meta.label}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="rise rise-3 border-t rule">
        {/* Weekday header */}
        <div className="grid grid-cols-7 border-b rule">
          {WEEKDAYS_EN.map((d) => (
            <div key={d} className="meta py-3 text-center">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 grid-rows-6">
          {days.map((d, i) => {
            const dateStr = fmt(d.date);
            const dayEvents = EVENTS.filter((e) => e.date === dateStr);
            const isToday = dateStr === today;
            return (
              <div
                key={i}
                className={clsx(
                  "min-h-[110px] border-b border-r rule px-2.5 py-2 relative",
                  d.outside && "bg-paper/40",
                  (i + 1) % 7 === 0 && "border-r-0"
                )}
              >
                <div
                  className={clsx(
                    "font-mono text-xs",
                    d.outside ? "text-ink-soft/40" : isToday ? "text-accent font-medium" : "text-ink-soft"
                  )}
                >
                  {d.date.getDate()}
                  {isToday && <span className="ml-1 text-accent">◆</span>}
                </div>
                <div className="mt-1 space-y-1">
                  {dayEvents.map((ev) => {
                    const meta = EVENT_TAG_META[ev.tag];
                    return (
                      <button
                        key={ev.id}
                        onClick={() => setSelected(ev)}
                        className="w-full text-left text-xs leading-tight px-1.5 py-1 hover:bg-card transition-colors border-l-2"
                        style={{ borderLeftColor: meta.color }}
                      >
                        <span className="text-ink">{ev.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-ink/40 backdrop-blur-sm grid place-items-center z-50 px-6"
          onClick={() => setSelected(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card border rule rounded-sm max-w-lg w-full shadow-2xl"
          >
            <div className="px-7 py-6 border-b rule">
              <div className="flex items-center gap-2 mb-2">
                <span className="dot" style={{ color: EVENT_TAG_META[selected.tag].color }} />
                <span className="meta">{EVENT_TAG_META[selected.tag].label}</span>
              </div>
              <h3 className="display text-2xl">{selected.title}</h3>
              <p className="meta mt-1">{selected.id}</p>
            </div>
            <div className="px-7 py-5 space-y-3 text-sm">
              <div className="grid grid-cols-[80px_1fr] items-baseline gap-3">
                <span className="meta">DATE</span>
                <span className="font-mono">{selected.date}{selected.start && `  ${selected.start} – ${selected.end ?? ""}`}</span>
              </div>
              {selected.location && (
                <div className="grid grid-cols-[80px_1fr] items-baseline gap-3">
                  <span className="meta">LOCATION</span>
                  <span>{selected.location}</span>
                </div>
              )}
              {selected.department && (
                <div className="grid grid-cols-[80px_1fr] items-baseline gap-3">
                  <span className="meta">DEPT</span>
                  <span>
                    {selected.department}
                    {selected.owner && (
                      <span className="text-ink-soft ml-2">· 负责人 {findUser(selected.owner)?.name}</span>
                    )}
                  </span>
                </div>
              )}
              {selected.description && (
                <div className="grid grid-cols-[80px_1fr] items-baseline gap-3">
                  <span className="meta">NOTE</span>
                  <span className="text-ink-soft leading-relaxed">{selected.description}</span>
                </div>
              )}
              {selected.attachments && (
                <div className="grid grid-cols-[80px_1fr] items-baseline gap-3">
                  <span className="meta">FILES</span>
                  <span className="flex flex-wrap gap-3">
                    {selected.attachments.map((a) => (
                      <a
                        key={a.name}
                        href="#"
                        className="border-b border-rule hover:border-accent hover:text-accent"
                      >
                        {a.name}.{a.ext}
                      </a>
                    ))}
                  </span>
                </div>
              )}
            </div>
            <div className="px-7 py-4 border-t rule flex justify-end gap-3">
              <button
                onClick={() => setSelected(null)}
                className="text-sm px-4 py-1.5 hover:text-accent"
              >
                关闭
              </button>
              <button className="text-sm px-4 py-1.5 bg-ink text-card">
                查看详情
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-20" />
    </div>
  );
}
