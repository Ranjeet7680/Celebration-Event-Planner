"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Badge, Card, Modal } from "@/components/ui";
import { useEvent, type EventSummary } from "@/context/EventContext";

export default function CalendarPage() {
  const { events } = useEvent();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "agenda">("month");
  const [selectedDayEvents, setSelectedDayEvents] = useState<EventSummary[] | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const setToday = () => {
    setCurrentDate(new Date());
  };

  // Find events for each day
  const getEventsForDay = (day: number) => {
    return events.filter((e) => {
      const d = new Date(e.eventDate);
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      );
    });
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-900/40 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-2">
              <CalendarIcon className="w-3.5 h-3.5 text-violet-400" />
              <span>Event Schedule & Milestone Timeline</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {monthNames[month]} {year}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="bg-[#171F35] border border-slate-700/80 rounded-xl p-1 flex items-center">
              <button
                onClick={() => setViewMode("month")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "month"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Month Grid
              </button>
              <button
                onClick={() => setViewMode("agenda")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "agenda"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Agenda List
              </button>
            </div>

            {/* Nav Arrows */}
            <div className="flex items-center gap-1 bg-[#171F35] border border-slate-700/80 rounded-xl p-1">
              <button
                onClick={prevMonth}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={setToday}
                className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Link href="/ai-creator">
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4" />
                <span>Add Event</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* View: Month Grid */}
        {viewMode === "month" ? (
          <div className="bg-[#171F35] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b border-slate-800 bg-[#11182B] text-center py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-800/80">
              {/* Empty placeholder cells for previous month */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[110px] p-2 bg-[#0B1020]/40 text-slate-700" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dayEvents = getEventsForDay(dayNum);
                const isToday =
                  new Date().getDate() === dayNum &&
                  new Date().getMonth() === month &&
                  new Date().getFullYear() === year;

                return (
                  <div
                    key={`day-${dayNum}`}
                    onClick={() => {
                      if (dayEvents.length > 0) setSelectedDayEvents(dayEvents);
                    }}
                    className={`min-h-[110px] p-2 transition-colors flex flex-col justify-between cursor-pointer ${
                      isToday
                        ? "bg-violet-950/20 border border-violet-500/30"
                        : "hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isToday
                            ? "bg-violet-600 text-white font-bold"
                            : "text-slate-400"
                        }`}
                      >
                        {dayNum}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </div>

                    <div className="space-y-1 overflow-hidden">
                      {dayEvents.map((ev) => (
                        <div
                          key={ev.id}
                          className="px-2 py-1 rounded-lg bg-violet-900/60 border border-violet-500/40 text-[11px] font-semibold text-white truncate shadow-sm"
                          title={ev.title}
                        >
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* View: Agenda List */
          <div className="space-y-4">
            {events.length === 0 ? (
              <Card className="p-8 text-center text-xs text-slate-400">
                No scheduled celebrations found.
              </Card>
            ) : (
              events.map((ev) => {
                const dateObj = new Date(ev.eventDate);
                return (
                  <Card key={ev.id} className="p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#0B1020] border border-slate-800 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] uppercase font-bold text-violet-400">
                          {dateObj.toLocaleString("en-US", { month: "short" })}
                        </span>
                        <span className="text-lg font-extrabold text-white">
                          {dateObj.getDate()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="violet">{ev.category}</Badge>
                          <Badge variant="default">{ev.status}</Badge>
                        </div>
                        <h3 className="text-base font-bold text-white">{ev.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          📍 {ev.location} • Budget: {ev.currency} {ev.budget.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <Link href={`/events/${ev.id}`}>
                      <Button variant="secondary" size="sm">
                        <span>Details</span>
                      </Button>
                    </Link>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Selected Day Events Modal */}
        {selectedDayEvents && (
          <Modal
            isOpen={Boolean(selectedDayEvents)}
            onClose={() => setSelectedDayEvents(null)}
            title="Scheduled Celebrations"
          >
            <div className="space-y-4">
              {selectedDayEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 rounded-xl bg-[#0B1020] border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="violet">{ev.category}</Badge>
                    <span className="text-xs text-amber-400 font-bold">
                      {ev.currency} {ev.budget.toLocaleString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{ev.title}</h4>
                  <p className="text-xs text-slate-400">📍 {ev.location}</p>
                  <div className="pt-2">
                    <Link href={`/events/${ev.id}`}>
                      <Button variant="primary" size="sm" className="w-full text-xs">
                        Open Celebration Cockpit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
