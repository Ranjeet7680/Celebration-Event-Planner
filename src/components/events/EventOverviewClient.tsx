"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  DollarSign,
  Users,
  CheckSquare,
  Clock,
  MapPin,
  Sparkles,
  Plus,
  Share2,
  Edit,
  Trash2,
  Mail,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Badge, Card, Modal } from "@/components/ui";

export function EventOverviewClient({ eventId }: { eventId: string }) {
  const router = useRouter();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editBudget, setEditBudget] = useState("");
  const [editStatus, setEditStatus] = useState("planned");

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data.event);
        setEditTitle(data.event.title);
        setEditLocation(data.event.location);
        setEditBudget(data.event.budget.toString());
        setEditStatus(data.event.status);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) fetchEvent();
  }, [eventId]);

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          location: editLocation,
          budget: Number(editBudget),
          status: editStatus,
        }),
      });
      if (res.ok) {
        setEditModalOpen(false);
        fetchEvent();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      if (res.ok) router.push("/dashboard");
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="py-20 text-center text-slate-400 text-xs">
          Loading event cockpit...
        </div>
      </AppShell>
    );
  }

  if (!event) {
    return (
      <AppShell>
        <div className="py-20 text-center space-y-3">
          <p className="text-sm text-slate-300">Celebration not found.</p>
          <Link href="/dashboard">
            <Button variant="secondary" size="sm">Back to Dashboard</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  // Calculations
  const totalTasks = event.tasks?.length || 0;
  const completedTasks = event.tasks?.filter((t: any) => t.status === "completed").length || 0;
  const taskPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalSpent = event.expenses
    ?.filter((exp: any) => exp.status === "paid")
    .reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0;
  const budgetUtilization = event.budget > 0 ? Math.round((totalSpent / event.budget) * 100) : 0;

  const attendingGuests = event.guests
    ?.filter((g: any) => g.rsvpStatus === "attending")
    .reduce((sum: number, g: any) => sum + 1 + (g.plusOne || 0), 0) || 0;

  const eventDateObj = new Date(event.eventDate);
  const daysRemaining = Math.ceil((eventDateObj.getTime() - Date.now()) / (1000 * 3600 * 24));

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Cover Header Hero */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
          <div className="h-64 sm:h-80 w-full relative">
            <img
              src={event.coverImage || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80"}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020] via-[#0B1020]/60 to-transparent" />

            {/* Top controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditModalOpen(true)}
                className="bg-black/50 backdrop-blur-md border-white/20"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                className="bg-rose-950/60 backdrop-blur-md border-rose-500/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Bottom title info */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="violet">{event.category}</Badge>
                  <Badge variant={event.status === "active" ? "success" : "default"}>
                    {event.status}
                  </Badge>
                  {daysRemaining > 0 ? (
                    <Badge variant="gold">{daysRemaining} days to go</Badge>
                  ) : (
                    <Badge variant="neutral">Completed</Badge>
                  )}
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {event.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-violet-400" />
                  <span>{event.location}</span>
                  <span>•</span>
                  <Calendar className="w-4 h-4 text-violet-400" />
                  <span>
                    {eventDateObj.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <Link href={`/events/${eventId}/invitation`}>
                  <Button variant="primary" size="sm">
                    <Mail className="w-3.5 h-3.5 text-amber-300" />
                    <span>View Invitation</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Main Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Budget Status</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {event.currency} {totalSpent.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                of {event.currency} {event.budget.toLocaleString()} ({budgetUtilization}%)
              </p>
            </div>
            <Link href={`/events/${eventId}/budget`}>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center hover:scale-105 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
            </Link>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Guest RSVPs</p>
              <p className="text-2xl font-bold text-indigo-400 mt-1">
                {attendingGuests} Attending
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Estimated capacity: {event.estimatedGuests}
              </p>
            </div>
            <Link href={`/events/${eventId}/guests`}>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </Link>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Kanban Progress</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {completedTasks}/{totalTasks}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {taskPercent}% milestones finished
              </p>
            </div>
            <Link href={`/events/${eventId}/tasks`}>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:scale-105 transition-transform">
                <CheckSquare className="w-5 h-5" />
              </div>
            </Link>
          </Card>
        </div>

        {/* Quick Operations Nav Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href={`/events/${eventId}/guests`}
            className="p-3.5 rounded-2xl bg-[#171F35] hover:bg-[#1E2945] border border-slate-800 flex items-center gap-3 transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Guests</p>
              <p className="text-[10px] text-slate-400">RSVPs & Badges</p>
            </div>
          </Link>

          <Link
            href={`/events/${eventId}/tasks`}
            className="p-3.5 rounded-2xl bg-[#171F35] hover:bg-[#1E2945] border border-slate-800 flex items-center gap-3 transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Tasks</p>
              <p className="text-[10px] text-slate-400">Kanban Board</p>
            </div>
          </Link>

          <Link
            href={`/events/${eventId}/budget`}
            className="p-3.5 rounded-2xl bg-[#171F35] hover:bg-[#1E2945] border border-slate-800 flex items-center gap-3 transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Budget</p>
              <p className="text-[10px] text-slate-400">Expense Guard</p>
            </div>
          </Link>

          <Link
            href={`/events/${eventId}/invitation`}
            className="p-3.5 rounded-2xl bg-[#171F35] hover:bg-[#1E2945] border border-slate-800 flex items-center gap-3 transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Invitation</p>
              <p className="text-[10px] text-slate-400">Designer Suite</p>
            </div>
          </Link>
        </div>

        {/* Two Column Layout: Description & Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white mb-2">Event Vision & Description</h3>
              <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed bg-[#0B1020] p-4 rounded-xl border border-slate-800">
                {event.description || "No detailed description provided."}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white">Urgent & In-Progress Tasks</h3>
                <Link href={`/events/${eventId}/tasks`} className="text-xs text-violet-400 hover:text-violet-300">
                  View all ({totalTasks})
                </Link>
              </div>

              <div className="space-y-2">
                {event.tasks?.slice(0, 5).map((task: any) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          task.status === "completed"
                            ? "bg-emerald-400"
                            : task.status === "in_progress"
                            ? "bg-amber-400"
                            : "bg-slate-500"
                        }`}
                      />
                      <span className="text-xs font-medium text-slate-200">{task.title}</span>
                    </div>
                    <Badge variant={task.priority === "urgent" ? "danger" : "default"}>
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white mb-3">Event Collaborators</h3>
              <div className="space-y-3">
                {event.collaborators?.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-200">{c.name}</p>
                      <p className="text-[11px] text-slate-500">{c.email}</p>
                    </div>
                    <Badge variant="violet">{c.role}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-white mb-3">Recent Expenses</h3>
              <div className="space-y-2">
                {event.expenses?.slice(0, 4).map((exp: any) => (
                  <div
                    key={exp.id}
                    className="p-2.5 rounded-xl bg-[#0B1020] border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-300">{exp.title}</p>
                      <p className="text-[10px] text-slate-500">{exp.category}</p>
                    </div>
                    <span className="font-bold text-amber-400">
                      {event.currency} {exp.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Edit Modal */}
        {editModalOpen && (
          <Modal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            title="Edit Celebration Details"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Total Budget</label>
                <input
                  type="number"
                  value={editBudget}
                  onChange={(e) => setEditBudget(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" size="sm" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleUpdate}>
                  Save Changes
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
