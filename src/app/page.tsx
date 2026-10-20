import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Calendar,
  CheckCircle2,
  DollarSign,
  Users,
  Compass,
  Store,
  ShieldCheck,
  Star,
  Zap,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100 flex flex-col selection:bg-violet-500/30 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-[#11182B]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-violet-600/30">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-white">PromptWars</span>
              <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block">Celebration & Event Planner</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#ai-engine" className="hover:text-white transition-colors">AI Engine</a>
            <a href="#showcase" className="hover:text-white transition-colors">Showcase</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary" size="sm">
                Live Demo
              </Button>
            </Link>
            <Link href="/ai-creator">
              <Button variant="primary" size="sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Create with AI</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-violet-600/20 via-indigo-600/20 to-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Next-Gen Celebration Planning Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Every celebration starts with a <span className="gradient-celebration">spark.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
            From multi-day cultural festivals and palace weddings to keynote corporate galas. PromptWars transforms your natural language vision into structured schedules, automated budgets, guest RSVPs, and coordinated vendor teams in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link href="/ai-creator" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto shadow-xl shadow-violet-600/25">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Generate Event with AI</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <span>Explore Interactive Demo</span>
              </Button>
            </Link>
          </div>

          {/* Social Proof Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 border-t border-slate-800/80 pt-8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Full Access Control & Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Instant Structured Output</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-400" />
              <span>Multi-user Collaboration</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive AI Prompt Simulator Preview */}
      <section id="ai-engine" className="py-12 bg-[#11182B]/60 border-y border-slate-800/80 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Describe your vision. Let AI engineer the reality.
            </h2>
            <p className="text-sm text-slate-400">
              Try the exact prompt that powers our Kolkata Spring Cultural Festival sample:
            </p>
          </div>

          <div className="bg-[#171F35] border border-slate-700/80 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-300 shrink-0">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div className="flex-1 bg-[#0B1020] border border-slate-800 rounded-xl p-4">
                <p className="text-sm text-slate-200 font-mono leading-relaxed">
                  &quot;Plan a college cultural festival for 800 attendees in Kolkata with a budget of ₹5,00,000. It should include a stage, music, food stalls, decorations, security, a volunteer team, and a two-day schedule.&quot;
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#11182B] p-4 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-400 font-medium">Estimated Budget</p>
                <p className="text-xl font-bold text-amber-400 mt-1">₹5,00,000</p>
                <p className="text-[11px] text-slate-400 mt-1">6 Category allocations</p>
              </div>
              <div className="bg-[#11182B] p-4 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-400 font-medium">Expected Headcount</p>
                <p className="text-xl font-bold text-violet-400 mt-1">800 Guests</p>
                <p className="text-[11px] text-slate-400 mt-1">Dual QR entry gates</p>
              </div>
              <div className="bg-[#11182B] p-4 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-400 font-medium">Auto-Generated Tasks</p>
                <p className="text-xl font-bold text-emerald-400 mt-1">8 Milestones</p>
                <p className="text-[11px] text-slate-400 mt-1">Prioritized Kanban</p>
              </div>
              <div className="bg-[#11182B] p-4 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-400 font-medium">Execution Schedule</p>
                <p className="text-xl font-bold text-indigo-400 mt-1">48 Hours</p>
                <p className="text-[11px] text-slate-400 mt-1">Hourly rundown</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="/ai-creator">
                <Button variant="gold" size="md">
                  <span>Open in AI Event Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Feature Pillars */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="violet" className="mb-3">Comprehensive Suite</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything your celebration needs, unified in one platform.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            No more fragmented spreadsheets, lost WhatsApp messages, or surprise budget overruns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#171F35] border border-slate-800 p-6 rounded-2xl hover:border-violet-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">AI Event Architecture</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate complete timelines, contingency checklists, run of show schedules, and vendor category requirements from a single prompt.
            </p>
          </div>

          <div className="bg-[#171F35] border border-slate-800 p-6 rounded-2xl hover:border-violet-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <DollarSign className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Real-Time Budget Guard</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Prevent unauthorized overspending with automated category limits, paid vs pending invoice tracking, and instant alerts.
            </p>
          </div>

          <div className="bg-[#171F35] border border-slate-800 p-6 rounded-2xl hover:border-violet-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">VIP & Guest RSVP Matrix</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track attendance, plus-ones, dietary restrictions, and invitation delivery status with instant CSV export for badge printing.
            </p>
          </div>

          <div className="bg-[#171F35] border border-slate-800 p-6 rounded-2xl hover:border-violet-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Venue Discovery & Specs</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore curated ballrooms, botanical pavilions, and skyline lounges with capacity filters, hourly rates, and verified technical amenities.
            </p>
          </div>

          <div className="bg-[#171F35] border border-slate-800 p-6 rounded-2xl hover:border-violet-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Store className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Vendor Marketplace</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect with top florists, artisanal caterers, photographers, and sound engineers with direct inquiry submission and price transparency.
            </p>
          </div>

          <div className="bg-[#171F35] border border-slate-800 p-6 rounded-2xl hover:border-violet-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Calendar className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Kanban & Calendar Sync</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Keep your team aligned across deadlines, vendor appointments, stage soundchecks, and municipal permit milestones.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-[#11182B]/60 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="gold" className="mb-3">Transparent Plans</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Designed for individual hosts to large production agencies.
            </h2>
            <p className="text-sm text-slate-400">
              Start free with full local demo capabilities, upgrade anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="bg-[#171F35] border border-slate-800 p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Starter</h3>
                <p className="text-xs text-slate-400 mb-6">For personal celebrations & birthdays</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-extrabold text-white">$0</span>
                  <span className="text-xs text-slate-400">/forever</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Up to 3 active events</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> AI Event Plan generator (Demo mode)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100 guest RSVPs & dietary tracking</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Digital invitation designer</li>
                </ul>
              </div>
              <Link href="/signup">
                <Button variant="outline" className="w-full">Get Started Free</Button>
              </Link>
            </div>

            {/* Pro Planner (Featured) */}
            <div className="bg-gradient-to-b from-[#1C2542] to-[#171F35] border-2 border-violet-500 p-8 rounded-2xl flex flex-col justify-between relative shadow-2xl shadow-violet-600/20">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                  Most Popular
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Pro Planner</h3>
                <p className="text-xs text-slate-400 mb-6">For weddings, fests & corporate galas</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-extrabold text-white">$49</span>
                  <span className="text-xs text-slate-400">/month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-200 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-violet-400" /> Unlimited active events</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-violet-400" /> Live Gemini / OpenAI structured plans</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-violet-400" /> Unlimited guest management & CSV export</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-violet-400" /> Multi-user team roles & collaborator permissions</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-violet-400" /> Vendor inquiry manager & expense guard</li>
                </ul>
              </div>
              <Link href="/signup">
                <Button variant="primary" className="w-full">Start 14-Day Pro Trial</Button>
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-[#171F35] border border-slate-800 p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Production Agency</h3>
                <p className="text-xs text-slate-400 mb-6">For large festival organizers & hotels</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-extrabold text-white">$199</span>
                  <span className="text-xs text-slate-400">/month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dedicated event architects</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Custom venue & vendor integration API</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Priority 24/7 day-of concierge support</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> SLA & security audit guarantee</li>
                </ul>
              </div>
              <Link href="/dashboard">
                <Button variant="secondary" className="w-full">Contact Enterprise</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B1020] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white">PromptWars</span>
              <p className="text-[11px] text-slate-400">Every celebration starts with a spark.</p>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            © 2026 PromptWars Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
