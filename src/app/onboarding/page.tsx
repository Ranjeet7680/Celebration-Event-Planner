"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { logger } from "@/lib/logger";

const eventCategories = [
  "Cultural Festivals",
  "Weddings & Receptions",
  "Tech & Corporate Galas",
  "Milestone Birthdays",
  "Charity & Non-Profit",
  "Campus Carnivals",
];

const experienceLevels = [
  { id: "beginner", title: "Beginner Host", desc: "First time planning a formal gathering" },
  { id: "intermediate", title: "Experienced Organizer", desc: "Planned multiple family or club events" },
  { id: "expert", title: "Master Producer", desc: "Professional planner managing multi-vendor teams" },
];

const budgetTiers = [
  { id: "low", label: "Value Conscious (< ₹1,00,000 / $5,000)" },
  { id: "medium", label: "Balanced Standard (₹1,00,000 - ₹5,00,000 / $5k-$25k)" },
  { id: "high", label: "Luxury Production (> ₹5,00,000 / $25,000+)" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Cultural Festivals",
    "Weddings & Receptions",
  ]);
  const [experience, setExperience] = useState("intermediate");
  const [budgetTier, setBudgetTier] = useState("high");
  const [themePreference] = useState("midnight");
  const [saving, setSaving] = useState(false);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planningExperience: experience,
          budgetRange: budgetTier,
          theme: themePreference,
        }),
      });
      router.push("/dashboard");
    } catch (e) {
      logger.error("Failed to save onboarding settings", e);
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1020] flex items-center justify-center p-4 selection:bg-violet-500/30 selection:text-white">
      <div className="w-full max-w-2xl bg-[#171F35] border border-slate-700/80 rounded-2xl p-6 sm:p-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-900/40 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Personalizing Your Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome to PromptWars
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Tell us about your events so our AI planning engine can tailor budgets, vendors, and timelines to your style.
          </p>
        </div>

        <div className="space-y-8">
          {/* Interests */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              1. What kinds of events do you plan?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {eventCategories.map((cat) => {
                const isSelected = selectedInterests.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleInterest(cat)}
                    className={`p-3 rounded-xl text-xs font-semibold text-left border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-violet-600/20 border-violet-500 text-violet-200 shadow-sm"
                        : "bg-[#0B1020] border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600"
                    }`}
                  >
                    <span>{cat}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Planning Experience */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              2. Your planning experience
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {experienceLevels.map((lvl) => {
                const isSelected = experience === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setExperience(lvl.id)}
                    className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-violet-600/20 border-violet-500 text-white shadow-sm"
                        : "bg-[#0B1020] border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <p className="text-xs font-bold text-white mb-1">{lvl.title}</p>
                    <p className="text-[11px] text-slate-400 leading-snug">{lvl.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget Range */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              3. Typical event scale & budget
            </label>
            <div className="space-y-2">
              {budgetTiers.map((tier) => {
                const isSelected = budgetTier === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setBudgetTier(tier.id)}
                    className={`w-full p-3 rounded-xl text-xs font-medium text-left border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-amber-950/30 border-amber-500/60 text-amber-200"
                        : "bg-[#0B1020] border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <span>{tier.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-800">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
            >
              Skip for now
            </button>
            <Button
              onClick={handleFinish}
              variant="primary"
              size="lg"
              disabled={saving}
            >
              <span>{saving ? "Configuring..." : "Launch Dashboard"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
