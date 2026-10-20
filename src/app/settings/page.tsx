"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  LogOut,
  Save,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Badge, Card } from "@/components/ui";
import { logger } from "@/lib/logger";

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState("Alex Morgan");
  const [email, setEmail] = useState("demo@promptwars.ai");
  const [role, setRole] = useState("planner");
  const [theme, setTheme] = useState("midnight");
  const [experience, setExperience] = useState("expert");
  const [budgetRange, setBudgetRange] = useState("high");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setName(data.user.name || "Alex Morgan");
            setEmail(data.user.email || "demo@promptwars.ai");
            setRole(data.user.role || "planner");
            if (data.user.preferences) {
              setTheme(data.user.preferences.theme || "midnight");
              setExperience(data.user.preferences.planningExperience || "expert");
              setBudgetRange(data.user.preferences.budgetRange || "high");
              setNotificationsEnabled(data.user.preferences.notificationsEnabled ?? true);
              setEmailUpdates(data.user.preferences.emailUpdates ?? true);
            }
          }
        }
      } catch (e) {
        logger.error("Failed to load settings", e);
      }
    }
    loadSettings();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          theme,
          planningExperience: experience,
          budgetRange,
          notificationsEnabled,
          emailUpdates,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      logger.error("Failed to save profile", e);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) return;
    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (e) {
      logger.error("Failed to sign out", e);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-900/40 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-2">
            <Settings className="w-3.5 h-3.5 text-violet-400" />
            <span>Account & Workspace Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Profile & Preferences</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your personal profile, notification thresholds, and AI planning configurations.
          </p>
        </div>

        {/* Profile Card */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-extrabold text-lg text-white ring-4 ring-violet-500/20">
              AM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{name}</h3>
                <Badge variant="gold" className="uppercase">{role}</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{email}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 pt-4 border-t border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address (Verified)
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full bg-[#0B1020]/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Default Theme
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="midnight">Midnight Navy (Default)</option>
                  <option value="dark">Deep Charcoal</option>
                  <option value="light">Luxury Minimal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Planning Experience
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="beginner">Beginner Host</option>
                  <option value="intermediate">Experienced Organizer</option>
                  <option value="expert">Master Producer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Budget Scale Tier
                </label>
                <select
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="low">Value Conscious</option>
                  <option value="medium">Balanced</option>
                  <option value="high">Luxury Production</option>
                </select>
              </div>
            </div>

            {/* Notification Toggles */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Alert Preferences
              </h4>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1020] border border-slate-800">
                <div>
                  <p className="text-xs font-semibold text-white">In-App Task & RSVP Alerts</p>
                  <p className="text-[11px] text-slate-400">Receive real-time notifications when guests RSVP or tasks are completed.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1020] border border-slate-800">
                <div>
                  <p className="text-xs font-semibold text-white">Weekly Executive Digest</p>
                  <p className="text-[11px] text-slate-400">Email summary of remaining budgets and approaching milestone deadlines.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailUpdates}
                  onChange={(e) => setEmailUpdates(e.target.checked)}
                  className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              {savedSuccess ? (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Preferences saved successfully!</span>
                </span>
              ) : (
                <span />
              )}

              <Button type="submit" variant="primary" size="sm" disabled={saving}>
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? "Saving..." : "Save Preferences"}</span>
              </Button>
            </div>
          </form>
        </Card>

        {/* Password Management Card */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-violet-400" />
            <span>Password & Security</span>
          </h3>

          {passwordSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300">
              Password updated successfully!
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  New Password (min 8 chars)
                </label>
                <input
                  type="password"
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="outline" size="sm">
                <span>Update Password</span>
              </Button>
            </div>
          </form>
        </Card>

        {/* Sign Out Card */}
        <Card className="p-6 flex items-center justify-between border-rose-500/20 bg-[#171F35]">
          <div>
            <h3 className="text-sm font-bold text-white">Sign Out of PromptWars</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Securely end your current session across this browser.
            </p>
          </div>

          <Button variant="danger" size="sm" onClick={handleSignOut}>
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </Button>
        </Card>
      </div>
    </AppShell>
  );
}
