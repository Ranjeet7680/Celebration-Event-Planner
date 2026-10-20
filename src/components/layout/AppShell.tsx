"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  Calendar,
  Users,
  CheckSquare,
  DollarSign,
  Mail,
  Compass,
  Store,
  Palette,
  BarChart3,
  Bell,
  Settings,
  Menu,
  X,
  Search,
  Plus,
  ChevronDown,
  LogOut,
  FolderOpen,
  UserCheck,
  Flame,
} from "lucide-react";
import { useEvent } from "@/context/EventContext";
import { Button, Badge } from "@/components/ui";

const navSections = [
  {
    title: "Planning & AI",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "AI Event Creator", href: "/ai-creator", icon: Sparkles, badge: "AI" },
      { name: "Event Templates", href: "/templates", icon: FolderOpen },
      { name: "Calendar", href: "/calendar", icon: Calendar },
      { name: "Analytics & Reports", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Event Operations",
    items: [
      { name: "Event Overview", href: "/events", icon: Flame },
      { name: "Guest Management", href: "/guests", icon: Users },
      { name: "Task Kanban", href: "/tasks", icon: CheckSquare },
      { name: "Budget Planner", href: "/budget", icon: DollarSign },
      { name: "Invitation Designer", href: "/invitations", icon: Mail },
      { name: "Theme Studio", href: "/studio", icon: Palette },
      { name: "Team & Access", href: "/team", icon: UserCheck },
    ],
  },
  {
    title: "Discovery & Market",
    items: [
      { name: "Venue Discovery", href: "/venues", icon: Compass },
      { name: "Vendor Marketplace", href: "/vendors", icon: Store },
    ],
  },
  {
    title: "Personal",
    items: [
      { name: "Notifications", href: "/notifications", icon: Bell },
      { name: "Profile & Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { events, activeEvent, setActiveEventId } = useEvent();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (e) {
      console.error(e);
    }
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const searchResults = searchQuery.trim()
    ? events.filter((e) =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#11182B] border-b border-slate-800 sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-600/30">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <span className="font-bold text-base tracking-tight text-white">PromptWars</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchModalOpen(true)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <Search className="w-5 h-5" />
          </button>
          <Link
            href="/notifications"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 relative"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500 ring-2 ring-[#11182B]" />
            )}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#11182B] border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-violet-600/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white">PromptWars</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-900/60 text-violet-300 border border-violet-500/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none mt-0.5">Every celebration starts with a spark</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Event Indicator */}
        <div className="px-4 py-3 bg-[#0B1020]/60 border-b border-slate-800/60">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
              Active Project
            </span>
            <Link href="/ai-creator" className="text-[11px] text-violet-400 hover:text-violet-300 font-medium">
              + New AI
            </Link>
          </div>
          <select
            value={activeEvent?.id || ""}
            onChange={(e) => setActiveEventId(e.target.value)}
            className="w-full bg-[#171F35] border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-violet-500"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((sec) => (
            <div key={sec.title}>
              <h4 className="px-3 text-[10px] font-bold tracking-wider uppercase text-slate-500 mb-2">
                {sec.title}
              </h4>
              <ul className="space-y-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? "bg-violet-600/15 text-violet-300 border border-violet-500/30 shadow-sm"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 ${
                              isActive ? "text-violet-400" : "text-slate-400"
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Profile Pill at Bottom of Sidebar */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0E1424]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#171F35]/70 border border-slate-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-violet-500/30">
                AM
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">Alex Morgan</p>
                <p className="text-[10px] text-slate-400 truncate">demo@promptwars.ai</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Desktop Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-[#11182B]/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            {/* Global Search Button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2.5 px-3.5 py-2 bg-[#171F35]/80 hover:bg-[#1E2945] border border-slate-700/60 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors w-full max-w-md cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search events, guests, tasks, venues...</span>
              <kbd className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Ctrl+K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* AI Generator Quick Action */}
            <Link href="/ai-creator">
              <Button size="sm" variant="primary" className="shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Event Creator</span>
              </Button>
            </Link>

            {/* Notification Bell */}
            <Link
              href="/notifications"
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-violet-500 ring-2 ring-[#11182B]" />
              )}
            </Link>

            {/* Settings Quick Link */}
            <Link
              href="/settings"
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="Profile & Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>

      {/* Global Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#171F35] border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-700/80 flex items-center gap-3">
              <Search className="w-5 h-5 text-violet-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search events, locations, categories..."
                className="bg-transparent border-none text-sm text-white placeholder-slate-400 focus:outline-none flex-1"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                ESC
              </button>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto space-y-2">
              {searchQuery.trim() === "" ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Start typing to search your celebrations, venues, or vendors...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => {
                      setActiveEventId(ev.id);
                      setSearchModalOpen(false);
                      router.push(`/events/${ev.id}`);
                    }}
                    className="w-full text-left p-3 rounded-xl bg-slate-800/40 hover:bg-violet-900/20 border border-slate-700/60 hover:border-violet-500/50 transition-all flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{ev.title}</p>
                      <p className="text-xs text-slate-400">
                        {ev.category} • {ev.location}
                      </p>
                    </div>
                    <Badge variant="violet">{ev.currency} {ev.budget.toLocaleString()}</Badge>
                  </button>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No matches found for &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
