"use client";

import React, { useState, useEffect } from "react";
import {
  UserCheck,
  UserPlus,
  Shield,
  Activity,
  Trash2,
  Mail,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Badge, Card, Modal } from "@/components/ui";
import { useEvent } from "@/context/EventContext";

export default function TeamPage() {
  const { activeEvent } = useEvent();
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [inviting, setInviting] = useState(false);

  const fetchTeamAndLogs = async () => {
    if (!activeEvent) return;
    try {
      const res = await fetch(`/api/events/${activeEvent.id}`);
      if (res.ok) {
        const data = await res.json();
        setCollaborators(data.event?.collaborators || []);
        setActivities(data.event?.activityLogs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamAndLogs();
  }, [activeEvent]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;
    setInviting(true);

    try {
      // Simulate team collaborator invitation
      const newCollab = {
        id: Date.now().toString(),
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
        status: "active",
        createdAt: new Date().toISOString(),
      };
      setCollaborators([...collaborators, newCollab]);
      setInviteName("");
      setInviteEmail("");
      setInviteModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setInviting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-900/40 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-2">
              <UserCheck className="w-3.5 h-3.5 text-violet-400" />
              <span>Multi-Role Access & Permissions</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Team Collaboration</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Invite co-producers, assign editorial responsibilities, and audit event change logs.
            </p>
          </div>

          <Button variant="primary" size="sm" onClick={() => setInviteModalOpen(true)}>
            <UserPlus className="w-4 h-4" />
            <span>Invite Collaborator</span>
          </Button>
        </div>

        {/* Collaborators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collaborators.map((member) => (
            <Card key={member.id} className="p-5 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                    {member.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{member.name}</h3>
                    <p className="text-xs text-slate-400">{member.email}</p>
                  </div>
                </div>
                <Badge
                  variant={
                    member.role === "owner"
                      ? "gold"
                      : member.role === "admin"
                      ? "violet"
                      : "neutral"
                  }
                  className="uppercase"
                >
                  {member.role}
                </Badge>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Active Access</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Added {new Date(member.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Card>
          ))}
        </div>

        {/* Roles Breakdown Card */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-violet-400" />
            <span>Server-Enforced Access Policy</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-[#0B1020] border border-slate-800">
              <p className="font-bold text-amber-300">Owner</p>
              <p className="text-slate-400 mt-1">Full control including event deletion, billing, and collaborator removal.</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0B1020] border border-slate-800">
              <p className="font-bold text-violet-300">Admin</p>
              <p className="text-slate-400 mt-1">Can edit budgets, send invitations, assign tasks, and invite editors.</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0B1020] border border-slate-800">
              <p className="font-bold text-indigo-300">Editor</p>
              <p className="text-slate-400 mt-1">Can update task statuses, manage guest RSVPs, and log expenses.</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0B1020] border border-slate-800">
              <p className="font-bold text-slate-300">Viewer</p>
              <p className="text-slate-400 mt-1">Read-only visibility for patrons, sponsors, and observers.</p>
            </div>
          </div>
        </Card>

        {/* Activity History Audit Stream */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white">Event Change & Audit Log</h3>
            </div>
            <span className="text-xs text-slate-500">Auto-recorded</span>
          </div>

          <div className="divide-y divide-slate-800">
            {activities.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No activity history found.
              </div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-white">{act.action}: </span>
                    <span className="text-slate-300">{act.details}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 shrink-0">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Invite Modal */}
        {inviteModalOpen && (
          <Modal
            isOpen={inviteModalOpen}
            onClose={() => setInviteModalOpen(false)}
            title="Invite Team Collaborator"
            description="Grant access to this event's planning cockpit."
          >
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Rohan Sen"
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="rohan.sen@college.edu"
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Role Assignment
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="admin">Admin (Manage tasks, budget, invitations)</option>
                  <option value="editor">Editor (Update tasks and RSVPs)</option>
                  <option value="viewer">Viewer (Read-only)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setInviteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={inviting}>
                  {inviting ? "Inviting..." : "Send Invitation"}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
