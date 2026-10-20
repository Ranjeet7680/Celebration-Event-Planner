"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Plus,
  Clock,
  User,
  AlertCircle,
  Trash2,
  Edit,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";
import { Button, Badge, Card, Modal } from "@/components/ui";
import { logger } from "@/lib/logger";

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in_progress" | "completed";
  category: string;
}

interface TaskMetrics {
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
  completionRate?: number;
  progressPercent?: number;
  urgentCount: number;
}

export function TaskKanbanView({ eventId }: { eventId?: string }) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [metrics, setMetrics] = useState<TaskMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Add/Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("Alex Morgan");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [category, setCategory] = useState("Production");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<"todo" | "in_progress" | "completed">("todo");
  const [saving, setSaving] = useState(false);

  const fetchTasks = async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`/api/events/${eventId}/tasks`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
        setMetrics(data.metrics);
      }
    } catch (e) {
      logger.error("Failed to fetch tasks", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [eventId]);

  const handleOpenAdd = (columnStatus?: "todo" | "in_progress" | "completed") => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setAssignedTo("Alex Morgan");
    setPriority("medium");
    setCategory("Production");
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setDueDate(defaultDate.toISOString().split("T")[0]);
    setStatus(columnStatus || "todo");
    setModalOpen(true);
  };

  const handleOpenEdit = (t: TaskItem) => {
    setEditingTask(t);
    setTitle(t.title);
    setDescription(t.description || "");
    setAssignedTo(t.assignedTo || "Alex Morgan");
    setPriority(t.priority);
    setCategory(t.category);
    setDueDate(t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : "");
    setStatus(t.status);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);

    try {
      if (editingTask) {
        const res = await fetch(`/api/tasks/${editingTask.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            assignedTo,
            priority,
            category,
            dueDate: dueDate || null,
            status,
          }),
        });
        if (res.ok) {
          setModalOpen(false);
          fetchTasks();
        }
      } else {
        const res = await fetch(`/api/events/${eventId}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            assignedTo,
            priority,
            category,
            dueDate: dueDate || null,
            status,
          }),
        });
        if (res.ok) {
          setModalOpen(false);
          fetchTasks();
        }
      }
    } catch (err) {
      logger.error("Failed to save task", err);
    } finally {
      setSaving(false);
    }
  };

  const handleMoveStatus = async (taskId: string, newStatus: "todo" | "in_progress" | "completed") => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTasks();
    } catch (e) {
      logger.error("Failed to move task status", e);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    try {
      await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      fetchTasks();
    } catch (e) {
      logger.error("Failed to delete task", e);
    }
  };

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const progressPercent = metrics?.progressPercent || 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-900/40 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-2">
            <CheckSquare className="w-3.5 h-3.5 text-violet-400" />
            <span>Operational Milestone Kanban</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Task Management</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Prioritize deliverables, assign owners, and track milestone execution leading up to event day.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => handleOpenAdd("todo")}>
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </Button>
      </div>

      {/* Progress Bar Header */}
      <Card className="p-4 bg-[#171F35] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center font-bold text-sm">
            {progressPercent}%
          </div>
          <div>
            <p className="text-xs font-bold text-white">Overall Milestone Completion</p>
            <p className="text-[11px] text-slate-400">
              {completedTasks.length} of {tasks.length} total tasks completed
            </p>
          </div>
        </div>

        <div className="w-full sm:w-64 h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </Card>

      {/* 3-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: To Do */}
        <div className="bg-[#11182B] border border-slate-800/80 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                To Do
              </h3>
            </div>
            <Badge variant="neutral">{todoTasks.length}</Badge>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {todoTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => handleOpenEdit(task)}
                onDelete={() => handleDelete(task.id)}
                onMoveForward={() => handleMoveStatus(task.id, "in_progress")}
              />
            ))}
            <button
              onClick={() => handleOpenAdd("todo")}
              className="w-full py-2.5 rounded-xl border border-dashed border-slate-700/80 hover:border-violet-500/60 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="bg-[#11182B] border border-slate-800/80 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                In Progress
              </h3>
            </div>
            <Badge variant="gold">{inProgressTasks.length}</Badge>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {inProgressTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => handleOpenEdit(task)}
                onDelete={() => handleDelete(task.id)}
                onMoveBack={() => handleMoveStatus(task.id, "todo")}
                onMoveForward={() => handleMoveStatus(task.id, "completed")}
              />
            ))}
            <button
              onClick={() => handleOpenAdd("in_progress")}
              className="w-full py-2.5 rounded-xl border border-dashed border-slate-700/80 hover:border-violet-500/60 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Column 3: Completed */}
        <div className="bg-[#11182B] border border-slate-800/80 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Completed
              </h3>
            </div>
            <Badge variant="success">{completedTasks.length}</Badge>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => handleOpenEdit(task)}
                onDelete={() => handleDelete(task.id)}
                onMoveBack={() => handleMoveStatus(task.id, "in_progress")}
              />
            ))}
            <button
              onClick={() => handleOpenAdd("completed")}
              className="w-full py-2.5 rounded-xl border border-dashed border-slate-700/80 hover:border-violet-500/60 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Add or Edit Task */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingTask ? "Edit Task" : "Create New Task"}
          description="Add a task with deadline, priority, and assignees."
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Confirm audio-visual technical rider"
                className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Sound, Decor, Permits..."
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as "urgent" | "high" | "medium" | "low")}
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assigned To
                </label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Column Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "todo" | "in_progress" | "completed")}
                className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Description / Notes
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Key deliverables, vendor contacts, or specifications..."
                className="w-full bg-[#0B1020] border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={saving}>
                {saving ? "Saving..." : editingTask ? "Update Task" : "Create Task"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function TaskCard({
  task,
  onEdit,
  onDelete,
  onMoveBack,
  onMoveForward,
}: {
  task: TaskItem;
  onEdit: () => void;
  onDelete: () => void;
  onMoveBack?: () => void;
  onMoveForward?: () => void;
}) {
  const [currentTimestamp] = React.useState(() => Date.now());
  const isOverdue =
    task.dueDate &&
    task.status !== "completed" &&
    new Date(task.dueDate).getTime() < currentTimestamp;

  const priorityBadge =
    task.priority === "urgent"
      ? "danger"
      : task.priority === "high"
      ? "gold"
      : task.priority === "medium"
      ? "violet"
      : "neutral";

  return (
    <div className="bg-[#171F35] border border-slate-800 rounded-xl p-3.5 space-y-2.5 shadow hover:border-violet-500/40 transition-all">
      <div className="flex items-center justify-between">
        <Badge variant={priorityBadge} className="capitalize">
          {task.priority}
        </Badge>
        <span className="text-[10px] text-slate-500 font-semibold">{task.category}</span>
      </div>

      <h4 className="text-xs font-bold text-white leading-snug">{task.title}</h4>

      {task.description && (
        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1 text-slate-300">
          <User className="w-3 h-3 text-slate-500" />
          <span className="truncate max-w-[100px]">{task.assignedTo || "Unassigned"}</span>
        </div>

        {task.dueDate && (
          <div
            className={`flex items-center gap-1 ${
              isOverdue ? "text-rose-400 font-bold" : "text-slate-400"
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>
              {new Date(task.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="pt-1 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            title="Edit"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          {onMoveBack && (
            <button
              onClick={onMoveBack}
              className="p-1 text-slate-400 hover:text-violet-300 rounded hover:bg-slate-800"
              title="Move backward"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {onMoveForward && (
            <button
              onClick={onMoveForward}
              className="p-1 text-slate-400 hover:text-emerald-400 rounded hover:bg-slate-800"
              title="Move forward"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
