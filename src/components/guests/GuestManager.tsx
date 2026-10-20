"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  Download,
  Filter,
  Trash2,
  Edit,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Utensils,
} from "lucide-react";
import { Button, Badge, Card, Modal } from "@/components/ui";

export function GuestManager({ eventId }: { eventId?: string }) {
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [rsvpFilter, setRsvpFilter] = useState("all");

  // Add Guest Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<any | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [group, setGroup] = useState("Friends");
  const [rsvpStatus, setRsvpStatus] = useState("pending");
  const [plusOne, setPlusOne] = useState("0");
  const [dietary, setDietary] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchGuests = async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`/api/events/${eventId}/guests`);
      if (res.ok) {
        const data = await res.json();
        setGuests(data.guests || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [eventId]);

  const handleOpenAdd = () => {
    setEditingGuest(null);
    setName("");
    setEmail("");
    setPhone("");
    setGroup("Friends");
    setRsvpStatus("pending");
    setPlusOne("0");
    setDietary("");
    setNotes("");
    setModalOpen(true);
  };

  const handleOpenEdit = (g: any) => {
    setEditingGuest(g);
    setName(g.name);
    setEmail(g.email || "");
    setPhone(g.phone || "");
    setGroup(g.group || "Friends");
    setRsvpStatus(g.rsvpStatus || "pending");
    setPlusOne((g.plusOne || 0).toString());
    setDietary(g.dietaryRestrictions || "");
    setNotes(g.notes || "");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    try {
      if (editingGuest) {
        const res = await fetch(`/api/guests/${editingGuest.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone,
            group,
            rsvpStatus,
            plusOne: Number(plusOne),
            dietaryRestrictions: dietary,
            notes,
          }),
        });
        if (res.ok) {
          setModalOpen(false);
          fetchGuests();
        }
      } else {
        const res = await fetch(`/api/events/${eventId}/guests`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone,
            group,
            rsvpStatus,
            plusOne: Number(plusOne),
            dietaryRestrictions: dietary,
            notes,
          }),
        });
        if (res.ok) {
          setModalOpen(false);
          fetchGuests();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this guest?")) return;
    try {
      const res = await fetch(`/api/guests/${id}`, { method: "DELETE" });
      if (res.ok) fetchGuests();
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickStatusChange = async (guestId: string, newStatus: string) => {
    try {
      await fetch(`/api/guests/${guestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rsvpStatus: newStatus }),
      });
      fetchGuests();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportCSV = () => {
    if (guests.length === 0) return;
    const headers = ["Name", "Email", "Phone", "Group", "RSVP Status", "Plus One", "Dietary", "Notes"];
    const rows = guests.map((g) => [
      `"${g.name}"`,
      `"${g.email || ""}"`,
      `"${g.phone || ""}"`,
      `"${g.group}"`,
      `"${g.rsvpStatus}"`,
      g.plusOne || 0,
      `"${g.dietaryRestrictions || ""}"`,
      `"${g.notes || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PromptWars_Guests_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered guests
  const filtered = guests.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.email && g.email.toLowerCase().includes(search.toLowerCase())) ||
      (g.notes && g.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesGroup = groupFilter === "all" || g.group === groupFilter;
    const matchesRsvp = rsvpFilter === "all" || g.rsvpStatus === rsvpFilter;

    return matchesSearch && matchesGroup && matchesRsvp;
  });

  // Totals
  const totalInvited = guests.reduce((sum, g) => sum + 1 + (g.plusOne || 0), 0);
  const attendingTotal = guests
    .filter((g) => g.rsvpStatus === "attending")
    .reduce((sum, g) => sum + 1 + (g.plusOne || 0), 0);
  const tentativeTotal = guests.filter((g) => g.rsvpStatus === "tentative").length;
  const declinedTotal = guests.filter((g) => g.rsvpStatus === "declined").length;
  const pendingTotal = guests.filter((g) => g.rsvpStatus === "pending").length;

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-900/40 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5 text-violet-400" />
            <span>Guest List & RSVP Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Guest Management</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track invitations, dietary requirements, VIP table allocations, and export badge rosters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={guests.length === 0}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>

          <Button variant="primary" size="sm" onClick={handleOpenAdd}>
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Guest</span>
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <Card className="p-4">
          <p className="text-[11px] text-slate-400 font-medium">Total Invited</p>
          <p className="text-2xl font-bold text-white mt-1">{totalInvited}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Includes +1s</p>
        </Card>

        <Card className="p-4">
          <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Attending</span>
          </p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{attendingTotal}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {totalInvited > 0 ? Math.round((attendingTotal / totalInvited) * 100) : 0}% rate
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            <span>Tentative</span>
          </p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{tentativeTotal}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Needs follow-up</p>
        </Card>

        <Card className="p-4">
          <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <span>Declined</span>
          </p>
          <p className="text-2xl font-bold text-rose-400 mt-1">{declinedTotal}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Regrets sent</p>
        </Card>

        <Card className="p-4 col-span-2 sm:col-span-1">
          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </p>
          <p className="text-2xl font-bold text-violet-300 mt-1">{pendingTotal}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Awaiting reply</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {["all", "VIP", "Family", "Friends", "Colleagues", "Vendors"].map((grp) => (
            <button
              key={grp}
              onClick={() => setGroupFilter(grp)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                groupFilter === grp
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-[#171F35] text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {grp.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email..."
              className="w-full bg-[#171F35] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <select
            value={rsvpFilter}
            onChange={(e) => setRsvpFilter(e.target.value)}
            className="bg-[#171F35] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="attending">Attending</option>
            <option value="tentative">Tentative</option>
            <option value="declined">Declined</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Guest Table */}
      <div className="bg-[#171F35] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#11182B] border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">Guest Name</th>
                <th className="py-3 px-4">Group</th>
                <th className="py-3 px-4">RSVP Status</th>
                <th className="py-3 px-4">Plus-Ones</th>
                <th className="py-3 px-4">Dietary / Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No guests match your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div>
                        <span>{g.name}</span>
                        {g.email && (
                          <p className="text-[11px] text-slate-400 font-normal">{g.email}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={g.group === "VIP" ? "gold" : "violet"}>{g.group}</Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={g.rsvpStatus}
                        onChange={(e) => handleQuickStatusChange(g.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none ${
                          g.rsvpStatus === "attending"
                            ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/40"
                            : g.rsvpStatus === "declined"
                            ? "bg-rose-950/40 text-rose-300 border-rose-500/40"
                            : g.rsvpStatus === "tentative"
                            ? "bg-amber-950/40 text-amber-300 border-amber-500/40"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        <option value="attending">Attending</option>
                        <option value="tentative">Tentative</option>
                        <option value="declined">Declined</option>
                        <option value="pending">Pending</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-slate-200">
                      {g.plusOne > 0 ? `+${g.plusOne}` : "None"}
                    </td>
                    <td className="py-3.5 px-4">
                      {g.dietaryRestrictions ? (
                        <div className="flex items-center gap-1.5 text-amber-300">
                          <Utensils className="w-3.5 h-3.5 shrink-0" />
                          <span>{g.dietaryRestrictions}</span>
                        </div>
                      ) : g.notes ? (
                        <span className="text-slate-400 truncate max-w-xs block">{g.notes}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(g)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                          title="Edit Guest"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(g.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                          title="Delete Guest"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingGuest ? "Edit Guest Record" : "Add New Guest"}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Ananya Roy"
                className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ananya@university.edu"
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98300 00000"
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Group
                </label>
                <select
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="VIP">VIP</option>
                  <option value="Family">Family</option>
                  <option value="Friends">Friends</option>
                  <option value="Colleagues">Colleagues</option>
                  <option value="Vendors">Vendors</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  RSVP Status
                </label>
                <select
                  value={rsvpStatus}
                  onChange={(e) => setRsvpStatus(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="attending">Attending</option>
                  <option value="tentative">Tentative</option>
                  <option value="declined">Declined</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Plus-Ones
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={plusOne}
                  onChange={(e) => setPlusOne(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Dietary Restrictions
              </label>
              <input
                type="text"
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                placeholder="Vegetarian, Gluten-Free, Nut Allergy..."
                className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Notes & Special Seating
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Requires front row seating, patron badge..."
                className="w-full bg-[#0B1020] border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={saving}>
                {saving ? "Saving..." : editingGuest ? "Update Guest" : "Add to List"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
