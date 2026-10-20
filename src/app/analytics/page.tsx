"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  DollarSign,
  Users,
  CheckSquare,
  TrendingUp,
  PieChart as PieIcon,
  Calendar,
  FileSpreadsheet,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  PieChart,
  Pie,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Badge, Card } from "@/components/ui";
import { useEvent } from "@/context/EventContext";

interface SpendingEntry {
  category: string;
  amount: number;
}

interface RsvpEntry {
  name: string;
  count: number;
  fill: string;
}

interface TaskEntry {
  name: string;
  count: number;
  fill: string;
}

interface AnalyticsPayload {
  summary: {
    totalEvents: number;
    totalBudget: number;
    totalSpent: number;
    remainingBudget: number;
    budgetUtilization: number;
    totalGuests: number;
    attendingGuests: number;
    rsvpRate: number;
    totalTasks: number;
    completedTasks: number;
    taskCompletionRate: number;
  };
  charts: {
    spendingByCategory: SpendingEntry[];
    rsvpBreakdown: RsvpEntry[];
    taskBreakdown: TaskEntry[];
  };
}

export default function AnalyticsPage() {
  const { events, activeEvent } = useEvent();
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const url = selectedEventId === "all" ? "/api/analytics" : `/api/analytics?eventId=${selectedEventId}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedEventId]);

  const handleExportReport = () => {
    if (!data) return;
    const reportData = {
      generatedAt: new Date().toISOString(),
      scope: selectedEventId === "all" ? "All Celebrations" : `Event ID: ${selectedEventId}`,
      summary: data.summary,
      spendingByCategory: data.charts.spendingByCategory,
      rsvpBreakdown: data.charts.rsvpBreakdown,
      taskBreakdown: data.charts.taskBreakdown,
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(reportData, null, 2))}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `PromptWars_Executive_Report_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const defaultSummary: AnalyticsPayload["summary"] = {
    totalEvents: 0,
    totalBudget: 0,
    totalSpent: 0,
    remainingBudget: 0,
    budgetUtilization: 0,
    totalGuests: 0,
    attendingGuests: 0,
    rsvpRate: 0,
    totalTasks: 0,
    completedTasks: 0,
    taskCompletionRate: 0,
  };

  const summary = data?.summary || defaultSummary;
  const charts = data?.charts || { spendingByCategory: [], rsvpBreakdown: [], taskBreakdown: [] };
  const spendingData = charts.spendingByCategory;
  const rsvpData = charts.rsvpBreakdown;
  const taskData = charts.taskBreakdown;

  const CATEGORY_COLORS = ["#8B5CF6", "#6366F1", "#F5C76B", "#EC4899", "#10B981", "#3B82F6"];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-900/40 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-2">
              <BarChart3 className="w-3.5 h-3.5 text-violet-400" />
              <span>Real-Time Performance Metrics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Analytics & Reports</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Cross-event financial utilization, RSVP confirmation curves, and task delivery velocity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-[#171F35] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 font-medium"
            >
              <option value="all">All Celebrations (Aggregate)</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>

            <Button variant="outline" size="sm" onClick={handleExportReport} disabled={!data}>
              <Download className="w-3.5 h-3.5" />
              <span>Export Executive Report</span>
            </Button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <p className="text-xs font-medium text-slate-400">Total Budget Tracked</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              ${(summary.totalBudget || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-amber-400 mt-1">
              ${(summary.totalSpent || 0).toLocaleString()} paid out ({summary.budgetUtilization || 0}%)
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-medium text-slate-400">Remaining Balance</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
              ${(summary.remainingBudget || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Liquid contingency</p>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-medium text-slate-400">Guest RSVP Rate</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400 mt-1">
              {summary.rsvpRate || 0}%
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {summary.attendingGuests || 0} attending of {summary.totalGuests || 0}
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-medium text-slate-400">Task Velocity</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-violet-300 mt-1">
              {summary.taskCompletionRate || 0}%
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {summary.completedTasks || 0} of {summary.totalTasks || 0} milestones
            </p>
          </Card>
        </div>

        {/* 2 Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Expenditure by Category */}
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span>Expenditure by Operational Category</span>
              </h3>
              <p className="text-xs text-slate-400">Paid expenses across line items</p>
            </div>

            {spendingData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spendingData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2945" vertical={false} />
                    <XAxis dataKey="category" stroke="#64748B" fontSize={10} interval={0} angle={-15} textAnchor="end" />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#171F35",
                        borderColor: "#334155",
                        borderRadius: "12px",
                        color: "#F8FAFC",
                        fontSize: "12px",
                      }}
                      formatter={(val: unknown) => [`$${Number(val).toLocaleString()}`, "Spent"]}
                    />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                      {spendingData.map((_entry: SpendingEntry, i: number) => (
                        <Cell key={`bar-${i}`} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-slate-500">
                No expense data available.
              </div>
            )}
          </Card>

          {/* Chart 2: RSVP Status Breakdown */}
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>RSVP Distribution</span>
              </h3>
              <p className="text-xs text-slate-400">Breakdown of confirmed vs pending responses</p>
            </div>

            {rsvpData.length > 0 ? (
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rsvpData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={4}
                      label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {rsvpData.map((entry: RsvpEntry, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#171F35",
                        borderColor: "#334155",
                        borderRadius: "12px",
                        color: "#F8FAFC",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-slate-500">
                No RSVP responses recorded.
              </div>
            )}
          </Card>
        </div>

        {/* Task Breakdown Progress Gauge */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-white mb-4">Task Milestone Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {taskData.map((td: TaskEntry) => (
              <div key={td.name} className="p-4 rounded-xl bg-[#0B1020] border border-slate-800 text-center">
                <p className="text-xs font-semibold text-slate-400">{td.name}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: td.fill }}>
                  {td.count}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Tasks</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
