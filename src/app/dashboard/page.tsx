"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Calendar,
  DollarSign,
  Users,
  CheckSquare,
  ArrowRight,
  Plus,
  Clock,
  Compass,
  Store,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Activity,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Badge, Card } from "@/components/ui";

interface EventItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  eventDate: string;
  location: string;
  budget: number;
  currency: string;
  status: string;
  coverImage?: string;
  estimatedGuests: number;
  tasks: { id: string; status: string; priority: string }[];
  guests: { id: string; rsvpStatus: string }[];
  expenses: { id: string; amount: number; status: string }[];
}

export default function DashboardPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [eventsRes, analyticsRes] = await Promise.all([
          fetch("/api/events"),
          fetch("/api/analytics"),
        ]);

        if (eventsRes.ok) {
          const data = await eventsRes.json();
          setEvents(data.events || []);
        }
        if (analyticsRes.ok) {
          const aData = await analyticsRes.json();
          setAnalytics(aData);
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalEvents = events.length;
  const totalTasks = events.reduce((acc, ev) => acc + (ev.tasks?.length || 0), 0);
  const completedTasks = events.reduce(
    (acc, ev) => acc + (ev.tasks?.filter((t) => t.status === "completed").length || 0),
    0
  );
  const totalBudget = events.reduce((acc, ev) => acc + (ev.budget || 0), 0);
  const totalGuests = events.reduce((acc, ev) => acc + (ev.estimatedGuests || 0), 0);

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-900/60 via-[#171F35] to-[#11182B] border border-violet-500/20 p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-900/50 border border-violet-400/30 text-violet-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>PromptWars Event Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready to create something unforgettable?
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Plan, organize, and orchestrate high-impact celebrations with structured AI, automated budgets, vendor contracts, and guest RSVPs.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <Link href="/ai-creator">
                <Button variant="gold" size="sm" className="font-semibold shadow-lg shadow-amber-500/20">
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Generate New AI Plan</span>
                </Button>
              </Link>
              <Link href="/templates">
                <Button variant="secondary" size="sm">
                  <span>Explore Templates</span>
                </Button>
              </Link>
              <Link href="/venues">
                <Button variant="ghost" size="sm" className="text-slate-300">
                  <Compass className="w-4 h-4" />
                  <span>Discover Venues</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Total Celebrations</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {totalEvents}
              </p>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Active & Planned</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Managed Budget</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1">
                ${totalBudget.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {analytics?.summary?.budgetUtilization || 0}% utilized
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Task Completion</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
                {completedTasks}/{totalTasks}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% done
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Expected Guests</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400 mt-1">
                {totalGuests.toLocaleString()}
              </p>
              <p className="text-[11px] text-indigo-300 mt-1">
                {analytics?.summary?.attendingGuests || 12} RSVP confirmed
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </Card>
        </div>

        {/* Active & Upcoming Events Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Your Celebrations</h2>
              <p className="text-xs text-slate-400">
                Manage timeline, guests, tasks, and budgets for your scheduled events.
              </p>
            </div>
            <Link href="/ai-creator">
              <Button variant="primary" size="sm">
                <Plus className="w-3.5 h-3.5" />
                <span>New Event</span>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => {
              const completedCount = ev.tasks?.filter((t) => t.status === "completed").length || 0;
              const progress = ev.tasks?.length ? Math.round((completedCount / ev.tasks.length) * 100) : 0;
              const dateFormatted = new Date(ev.eventDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={ev.id}
                  className="bg-[#171F35] border border-slate-800 rounded-2xl overflow-hidden hover:border-violet-500/40 transition-all flex flex-col justify-between group shadow-lg"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                    <img
                      src={ev.coverImage || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80"}
                      alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#171F35] via-transparent to-black/30" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge variant="violet">{ev.category}</Badge>
                      <Badge variant={ev.status === "active" ? "success" : "default"}>
                        {ev.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                        {ev.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{dateFormatted}</span>
                        <span>•</span>
                        <span className="truncate">{ev.location}</span>
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Budget:</span>
                        <span className="font-semibold text-amber-400">
                          {ev.currency} {ev.budget.toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Task Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <Link href={`/events/${ev.id}`} className="flex-1">
                          <Button variant="secondary" size="sm" className="w-full text-xs">
                            <span>Open Overview</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity & Quick Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-bold text-white">Live Event Audit Activity</h3>
              </div>
              <Link href="/analytics" className="text-xs text-violet-400 hover:text-violet-300">
                View Reports
              </Link>
            </div>

            <div className="space-y-3">
              {analytics?.recentActivities?.length ? (
                analytics.recentActivities.map((act: any) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-200">{act.action}</p>
                      <p className="text-slate-400 mt-0.5">{act.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {new Date(act.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">
                  No recent activities logged yet.
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-2">Shortcuts & Tools</h3>
              <p className="text-xs text-slate-400 mb-4">Jump directly to critical management centers:</p>

              <div className="space-y-2">
                <Link
                  href="/guests"
                  className="p-2.5 rounded-xl bg-[#0B1020] hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-xs text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Guest Manager & RSVP</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </Link>

                <Link
                  href="/budget"
                  className="p-2.5 rounded-xl bg-[#0B1020] hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-xs text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <span>Budget & Expense Guard</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </Link>

                <Link
                  href="/tasks"
                  className="p-2.5 rounded-xl bg-[#0B1020] hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-xs text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-4 h-4 text-violet-400" />
                    <span>Kanban Workflow Board</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </Link>

                <Link
                  href="/invitations"
                  className="p-2.5 rounded-xl bg-[#0B1020] hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-xs text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <span>Digital Invitation Designer</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </Link>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800">
              <Link href="/vendors">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Store className="w-3.5 h-3.5 text-slate-400" />
                  <span>Browse Vendor Marketplace</span>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
