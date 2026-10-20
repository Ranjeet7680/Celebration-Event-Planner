"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useEvent } from "@/context/EventContext";
import { Plus, ArrowRight } from "lucide-react";
import { Button, Badge } from "@/components/ui";

export default function EventsIndexPage() {
  const { events, setActiveEventId } = useEvent();

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">All Celebrations</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select an event to open its complete management cockpit.
            </p>
          </div>
          <Link href="/ai-creator">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4" />
              <span>Create Event</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-[#171F35] border border-slate-800 rounded-2xl overflow-hidden hover:border-violet-500/40 transition-all flex flex-col justify-between group shadow-xl"
            >
              <div className="relative h-44 w-full bg-slate-900">
                <img
                  src={ev.coverImage || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80"}
                  alt={ev.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171F35] via-transparent to-black/30" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant="violet">{ev.category}</Badge>
                  <Badge variant="default">{ev.status}</Badge>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                    {ev.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    📍 {ev.location}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Budget</span>
                    <span className="font-bold text-amber-400">
                      {ev.currency} {ev.budget.toLocaleString()}
                    </span>
                  </div>

                  <Link
                    href={`/events/${ev.id}`}
                    onClick={() => setActiveEventId(ev.id)}
                    className="block"
                  >
                    <Button variant="secondary" size="sm" className="w-full text-xs">
                      <span>Open Overview</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
