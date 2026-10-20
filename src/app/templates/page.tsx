"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FolderOpen,
  Search,
  Users,
  DollarSign,
  Clock,
  Sparkles,
  ArrowRight,
  Star,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Badge, Card, Modal } from "@/components/ui";
import { useEvent } from "@/context/EventContext";
import { useDebounce } from "@/hooks/useDebounce";
import type { EventTemplateEntity } from "@/types";

export default function TemplatesPage() {
  const router = useRouter();
  const { refreshEvents, setActiveEventId } = useEvent();
  const [templates, setTemplates] = useState<EventTemplateEntity[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplateEntity | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchTemplates = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (debouncedSearch) params.append("search", debouncedSearch);

      const res = await fetch(`/api/templates?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory, debouncedSearch]);

  const handleUseTemplate = (tpl: EventTemplateEntity) => {
    setSelectedTemplate(tpl);
    setCustomTitle(tpl.title);
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    setEventDate(defaultDate.toISOString().split("T")[0]);
  };

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate) return;
    setCreating(true);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          customTitle,
          eventDate,
        }),
      });

      const data = await res.json();
      if (res.ok && data.event) {
        await refreshEvents();
        setActiveEventId(data.event.id);
        router.push(`/events/${data.event.id}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
      setSelectedTemplate(null);
    }
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-900/40 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-2">
            <FolderOpen className="w-3.5 h-3.5 text-violet-400" />
            <span>Pre-Engineered Event Blueprints</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Event Templates</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Jumpstart your planning with production-tested blueprints for festivals, weddings, and corporate summits.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {["all", "Cultural", "Wedding", "Corporate", "Birthday"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-[#171F35] text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full bg-[#171F35] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-[#171F35] border border-slate-800 rounded-2xl overflow-hidden hover:border-violet-500/40 transition-all flex flex-col justify-between group shadow-xl"
            >
              <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                <img
                  src={tpl.coverImage}
                  alt={tpl.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171F35] via-transparent to-black/30" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant="violet">{tpl.category}</Badge>
                  {tpl.isFavorite && (
                    <Badge variant="gold" className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>Popular</span>
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                    {tpl.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center bg-[#0B1020] p-2.5 rounded-xl border border-slate-800">
                    <div>
                      <p className="text-[10px] text-slate-400">Headcount</p>
                      <p className="text-xs font-bold text-white mt-0.5">{tpl.guestCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Est. Budget</p>
                      <p className="text-xs font-bold text-amber-400 mt-0.5">${tpl.estimatedBudget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Duration</p>
                      <p className="text-xs font-bold text-violet-300 mt-0.5">{tpl.duration}</p>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUseTemplate(tpl)}
                    className="w-full text-xs shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Create Event from Template</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Create Event from Template */}
        {selectedTemplate && (
          <Modal
            isOpen={Boolean(selectedTemplate)}
            onClose={() => setSelectedTemplate(null)}
            title={`Use Template: ${selectedTemplate.title}`}
            description="Customize your celebration details to create your project instantly."
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Event Date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="bg-[#11182B] p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-white">Includes with this blueprint:</p>
                <p>• Estimated budget template: ${selectedTemplate.estimatedBudget.toLocaleString()}</p>
                <p>• Pre-configured timeline milestones and starter tasks</p>
                <p>• Target capacity: {selectedTemplate.guestCount} attendees</p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={handleCreateFromTemplate}
                  disabled={creating}
                >
                  <span>{creating ? "Deploying..." : "Launch Event Project"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
