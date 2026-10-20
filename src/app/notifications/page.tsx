"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { logger } from "@/lib/logger";
import {
  Bell,
  CheckCircle2,
  CheckSquare,
  Users,
  DollarSign,
  Info,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card } from "@/components/ui";

interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all");
  const [_loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      logger.error("Failed to fetch notifications", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (e) {
      logger.error("Failed to mark all as read", e);
    }
  };

  const handleMarkOneAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      logger.error("Failed to mark notification as read", e);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "task") return n.type === "task";
    if (filter === "rsvp") return n.type === "rsvp";
    if (filter === "budget") return n.type === "budget";
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "task":
        return <CheckSquare className="w-4 h-4 text-emerald-400" />;
      case "rsvp":
        return <Users className="w-4 h-4 text-indigo-400" />;
      case "budget":
        return <DollarSign className="w-4 h-4 text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-violet-400" />;
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-900/40 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-2">
              <Bell className="w-3.5 h-3.5 text-violet-400" />
              <span>Real-Time Alert Feed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Notifications & Inbox
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Stay synchronized with task handoffs, VIP RSVP changes, and budget guard alerts.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mark All as Read ({unreadCount})</span>
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All Alerts" },
            { id: "unread", label: `Unread (${unreadCount})` },
            { id: "task", label: "Tasks" },
            { id: "rsvp", label: "RSVPs" },
            { id: "budget", label: "Budget" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filter === tab.id
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-[#171F35] text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notification Cards List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-400">
              No notifications matching this filter.
            </Card>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleMarkOneAsRead(item.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  !item.isRead
                    ? "bg-[#1C2542] border-violet-500/40 shadow-lg"
                    : "bg-[#171F35]/80 border-slate-800/80 hover:bg-[#1E2945]"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#0B1020] border border-slate-700/80 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-slate-500 mt-2 block">
                      {new Date(item.createdAt).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {item.link && (
                  <Link
                    href={item.link}
                    className="shrink-0 text-violet-400 hover:text-violet-300 p-2 rounded-xl hover:bg-slate-800"
                    title="View related record"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
