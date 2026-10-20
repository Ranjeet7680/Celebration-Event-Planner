"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  RefreshCw,
  Save,
  CheckCircle2,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Clock,
  ShieldAlert,
  Layers,
  ArrowRight,
  Info,
  Check,
  FileText,
  SlidersHorizontal,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Badge, Card } from "@/components/ui";
import { GeneratedEventPlan } from "@/lib/ai";
import { useEvent } from "@/context/EventContext";

const samplePrompts = [
  {
    title: "Kolkata Cultural Fest",
    prompt:
      "Plan a college cultural festival for 800 attendees in Kolkata with a budget of ₹5,00,000. It should include a stage, music, food stalls, decorations, security, a volunteer team, and a two-day schedule.",
  },
  {
    title: "Royal Palace Wedding",
    prompt:
      "Plan a 3-day royal palace wedding for 250 guests in Udaipur with a budget of $65,000, floral mandap, live sitar ensemble, royal welcome, and fireworks.",
  },
  {
    title: "Silicon Valley Tech Gala",
    prompt:
      "Plan an AI product launch summit for 350 executives in San Francisco with a $45,000 budget, keynote theater, VIP networking cocktail, and live stream rig.",
  },
  {
    title: "Neon Rooftop Birthday",
    prompt:
      "Plan a milestone 30th birthday party for 80 friends on a rooftop in Chicago with a $12,000 budget, signature cocktail bar, DJ set, and customized neon signs.",
  },
];

export default function AICreatorPage() {
  const router = useRouter();
  const { refreshEvents, setActiveEventId } = useEvent();
  const [prompt, setPrompt] = useState(samplePrompts[0].prompt);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    plan: GeneratedEventPlan;
    isDemoMode: boolean;
    provider: string;
    warning?: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<
    "overview" | "budget" | "timeline" | "schedule" | "tasks" | "risks" | "team"
  >("overview");

  const handleGenerate = async (promptText?: string) => {
    const textToUse = promptText || prompt;
    if (!textToUse || textToUse.trim().length < 5) {
      setError("Please describe the celebration requirements in detail.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToUse }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate plan");
      }

      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred while generating the plan";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!result?.plan) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/save-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: result.plan,
          prompt,
          isDemoMode: result.isDemoMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save plan to database");
      }

      await refreshEvents();
      setActiveEventId(data.eventId);
      router.push(`/events/${data.eventId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to convert plan into database event";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // Section regenerator mock
  const handleRegenerateSection = (section: string) => {
    if (!result) return;
    handleGenerate(prompt + ` (Please re-optimize the ${section} section with alternative options)`);
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-900/40 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>PromptWars AI Event Planning Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              AI Event Architect
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Turn natural language vision into structured, production-ready celebration plans.
            </p>
          </div>

          {result && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerate()}
                disabled={loading || saving}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Regenerate</span>
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={handleSavePlan}
                disabled={saving}
                className="shadow-lg shadow-amber-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? "Saving to Database..." : "Save & Create Event"}</span>
              </Button>
            </div>
          )}
        </div>

        {/* Prompt Input Box & Sample Chips */}
        <Card className="p-6 border-slate-700/80 shadow-2xl relative">
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Natural Language Event Prompt
            </label>
            <div className="relative">
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your event requirements (e.g., target attendees, city, total budget, specific vendors, dates, and requirements)..."
                className="w-full bg-[#0B1020] border border-slate-700 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 leading-relaxed font-sans"
              />
            </div>
          </div>

          {/* Preset Prompts Chips */}
          <div className="mb-5">
            <p className="text-[11px] font-semibold text-slate-400 mb-2">
              Or test with one of these pre-configured prompts:
            </p>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((sp) => (
                <button
                  key={sp.title}
                  type="button"
                  onClick={() => {
                    setPrompt(sp.prompt);
                    handleGenerate(sp.prompt);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#11182B] hover:bg-violet-950/40 border border-slate-700/70 hover:border-violet-500/50 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  ✨ {sp.title}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Info className="w-4 h-4 text-violet-400" />
              <span>Includes budget line items, 48-hr hourly rundown, risk matrix, and tasks.</span>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => handleGenerate()}
              disabled={loading}
              className="shadow-lg shadow-violet-600/30"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Synthesizing Event Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Event Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </Card>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Generated Result Preview */}
        {result && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Mode & Provider Notification Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#171F35] to-[#11182B] border border-violet-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                    result.isDemoMode
                      ? "bg-amber-950/50 text-amber-300 border-amber-500/40"
                      : "bg-emerald-950/50 text-emerald-300 border-emerald-500/40"
                  }`}
                >
                  {result.isDemoMode ? "LOCAL DEMO ENGINE" : `LIVE AI (${result.provider.toUpperCase()})`}
                </span>
                <span className="text-xs text-slate-300">
                  {result.warning || "Structured schema validated. Ready to deploy to your database."}
                </span>
              </div>

              <Button
                variant="gold"
                size="sm"
                onClick={handleSavePlan}
                disabled={saving}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save to Database</span>
              </Button>
            </div>

            {/* Plan Preview Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
              {(
                [
                  { id: "overview", label: "Executive Overview" },
                  { id: "budget", label: "Budget Breakdown" },
                  { id: "timeline", label: "Preparation Timeline" },
                  { id: "schedule", label: "Day-of Schedule" },
                  { id: "tasks", label: "Task Checklist" },
                  { id: "team", label: "Team & Vendors" },
                  { id: "risks", label: "Risk Mitigation" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Overview */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <Badge variant="violet" className="mb-2">
                        {result.plan.category}
                      </Badge>
                      <h2 className="text-2xl font-extrabold text-white">
                        {result.plan.eventName}
                      </h2>
                      <p className="text-sm font-medium text-amber-300 mt-1">
                        {result.plan.tagline}
                      </p>
                    </div>

                    <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6">
                      <p className="text-xs text-slate-400">Total Budget</p>
                      <p className="text-2xl font-extrabold text-amber-400">
                        {result.plan.currency} {result.plan.totalEstimatedBudget.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#0B1020] p-4 rounded-xl border border-slate-800">
                    {result.plan.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                    <div className="bg-[#11182B] p-3 rounded-xl border border-slate-800">
                      <p className="text-[11px] text-slate-400">Proposed Location</p>
                      <p className="text-xs font-semibold text-white mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <span className="truncate">{result.plan.proposedLocation}</span>
                      </p>
                    </div>

                    <div className="bg-[#11182B] p-3 rounded-xl border border-slate-800">
                      <p className="text-[11px] text-slate-400">Proposed Date</p>
                      <p className="text-xs font-semibold text-white mt-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <span>{result.plan.proposedDate}</span>
                      </p>
                    </div>

                    <div className="bg-[#11182B] p-3 rounded-xl border border-slate-800">
                      <p className="text-[11px] text-slate-400">Expected Guests</p>
                      <p className="text-xs font-semibold text-white mt-1 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <span>{result.plan.estimatedGuests} Attendees</span>
                      </p>
                    </div>

                    <div className="bg-[#11182B] p-3 rounded-xl border border-slate-800">
                      <p className="text-[11px] text-slate-400">Duration</p>
                      <p className="text-xs font-semibold text-white mt-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <span>{result.plan.duration}</span>
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Suggested Venue Specs */}
                <Card className="p-6">
                  <h3 className="text-sm font-bold text-white mb-3">Venue Requirements & Technical Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.plan.suggestedVenueRequirements?.map((spec, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-[#0B1020] border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Tab 2: Budget Breakdown */}
            {activeTab === "budget" && (
              <Card className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Budget Allocation Framework</h3>
                    <p className="text-xs text-slate-400">
                      Line-item distribution across 6 operational expense buckets
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRegenerateSection("budget allocation")}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Rebalance Budget</span>
                  </Button>
                </div>

                <div className="space-y-4">
                  {result.plan.budgetBreakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#0B1020] border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-semibold text-white">{item.category}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400">{item.percentage}%</span>
                          <span className="font-bold text-amber-400">
                            {result.plan.currency} {item.allocatedAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.notes}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Tab 3: Timeline */}
            {activeTab === "timeline" && (
              <Card className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">4-Phase Preparation Timeline</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRegenerateSection("timeline")}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Adjust Phases</span>
                  </Button>
                </div>

                <div className="space-y-4">
                  {result.plan.preparationTimeline.map((phase, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#0B1020] border border-slate-800"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-violet-300">{phase.phase}</h4>
                        <Badge variant="gold">{phase.daysBefore}</Badge>
                      </div>
                      <ul className="space-y-2">
                        {phase.deliverables.map((deliv, di) => (
                          <li
                            key={di}
                            className="flex items-start gap-2.5 text-xs text-slate-300"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                            <span>{deliv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Tab 4: Day Schedule */}
            {activeTab === "schedule" && (
              <Card className="p-6 space-y-6">
                <h3 className="text-base font-bold text-white">Event-Day Run of Show Schedule</h3>
                <div className="divide-y divide-slate-800">
                  {result.plan.eventDaySchedule.map((item, idx) => (
                    <div key={idx} className="py-3.5 flex items-start gap-4">
                      <span className="text-xs font-mono font-bold text-amber-400 shrink-0 w-20">
                        {item.time}
                      </span>
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-white">
                          {item.activity}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          📍 {item.location} {item.notes && `• ${item.notes}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Tab 5: Tasks */}
            {activeTab === "tasks" && (
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Generated Task Checklist</h3>
                  <span className="text-xs text-slate-400">
                    Will be synced directly to Kanban board
                  </span>
                </div>

                <div className="space-y-2">
                  {result.plan.taskChecklist.map((task, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#0B1020] border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="text-xs font-semibold text-slate-200">{task.title}</p>
                          <p className="text-[11px] text-slate-500">{task.category}</p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          task.priority === "urgent"
                            ? "danger"
                            : task.priority === "high"
                            ? "gold"
                            : "violet"
                        }
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Tab 6: Team & Vendors */}
            {activeTab === "team" && (
              <div className="space-y-6">
                <Card className="p-6 space-y-4">
                  <h3 className="text-base font-bold text-white">Recommended Staffing Roles</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {result.plan.requiredTeamRoles.map((role, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-[#0B1020] border border-slate-800"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="text-xs font-bold text-violet-300">{role.role}</h4>
                          <Badge variant="violet">{role.suggestedHeadcount} people</Badge>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {role.responsibilities}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 space-y-4">
                  <h3 className="text-base font-bold text-white">Recommended Vendor Categories</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {result.plan.vendorCategories.map((vCat, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-[#0B1020] border border-slate-700 text-xs text-slate-300 font-medium"
                      >
                        🛍️ {vCat}
                      </span>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Tab 7: Risk Mitigation */}
            {activeTab === "risks" && (
              <Card className="p-6 space-y-4">
                <h3 className="text-base font-bold text-white">Contingency & Risk Matrix</h3>
                <div className="space-y-3">
                  {result.plan.riskContingencyChecklist.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#0B1020] border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white">{item.risk}</h4>
                        <Badge
                          variant={
                            item.severity === "High"
                              ? "danger"
                              : item.severity === "Medium"
                              ? "gold"
                              : "violet"
                          }
                        >
                          {item.severity} Risk
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        <span className="text-emerald-400 font-semibold">Mitigation: </span>
                        {item.mitigationPlan}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Bottom Floating Save Action */}
            <div className="p-4 rounded-2xl bg-[#171F35] border border-slate-700/80 shadow-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Satisfied with this event blueprint?</p>
                <p className="text-[11px] text-slate-400">
                  Clicking save will instantly create the event, populate all tasks into Kanban, and setup budget categories.
                </p>
              </div>
              <Button
                variant="gold"
                size="md"
                onClick={handleSavePlan}
                disabled={saving}
                className="shadow-xl shadow-amber-500/25"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Deploying Event..." : "Accept & Create Event"}</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
