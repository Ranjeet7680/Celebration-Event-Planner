"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Save,
  Printer,
  Share2,
  Palette,
  Type,
  MapPin,
  Calendar,
  CheckCircle2,
  QrCode,
  Layers,
} from "lucide-react";
import { Button, Badge, Card } from "@/components/ui";
import { logger } from "@/lib/logger";

const templateThemes = [
  { id: "luminary", name: "Modern Luminary", primary: "#8B5CF6", accent: "#F5C76B", font: "sans" },
  { id: "royal", name: "Royal Heritage Crest", primary: "#6366F1", accent: "#F5C76B", font: "serif" },
  { id: "midnight", name: "Celestial Midnight", primary: "#10B981", accent: "#8B5CF6", font: "display" },
  { id: "champagne", name: "Champagne Elegance", primary: "#F59E0B", accent: "#EC4899", font: "serif" },
];

export function InvitationDesigner({ eventId }: { eventId?: string }) {
  const [headline, setHeadline] = useState("Kolkata Spring Cultural Festival 2026");
  const [message, setMessage] = useState(
    "You are cordially invited to celebrate two days of headline music, art, artisanal Bengali street food, and unforgettable performances."
  );
  const [venueAddress, setVenueAddress] = useState("The Glasshouse Pavilion & Botanical Gardens, Kolkata");
  const [dressCode, setDressCode] = useState("Boho Festival Chic / Vibrant Traditional");
  const [primaryColor, setPrimaryColor] = useState("#8B5CF6");
  const [accentColor, setAccentColor] = useState("#F5C76B");
  const [fontStyle, setFontStyle] = useState("sans");
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    async function loadInvitation() {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        if (res.ok) {
          const data = await res.json();
          const inv = data.event.invitations?.[0];
          if (inv) {
            setHeadline(inv.headline);
            setMessage(inv.message);
            if (inv.venueAddress) setVenueAddress(inv.venueAddress);
            if (inv.dressCode) setDressCode(inv.dressCode);
            setPrimaryColor(inv.primaryColor || "#8B5CF6");
            setAccentColor(inv.accentColor || "#F5C76B");
            setFontStyle(inv.fontStyle || "sans");
            setIsPublished(inv.isPublished ?? true);
          } else {
            setHeadline(data.event.title);
            setVenueAddress(data.event.location);
          }
        }
      } catch (e) {
        logger.error("Failed to load invitation", e);
      }
    }
    loadInvitation();
  }, [eventId]);

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      // simulate save
      await new Promise((r) => setTimeout(r, 600));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      logger.error("Failed to save invitation", e);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950/40 border border-pink-500/30 text-pink-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Digital & Print Invitation Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Invitation Designer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Craft customized digital invitation suites with verified QR check-in badges and print-ready layouts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF Export</span>
          </Button>

          <Button variant="gold" size="sm" onClick={handleSave} disabled={saving}>
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Saving..." : savedSuccess ? "Saved!" : "Save Invitation"}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Customizer Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              <span>Design Themes</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {templateThemes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    setPrimaryColor(theme.primary);
                    setAccentColor(theme.accent);
                    setFontStyle(theme.font);
                  }}
                  className="p-3 rounded-xl border border-slate-700 bg-[#0B1020] hover:border-violet-500/60 text-left transition-all cursor-pointer"
                >
                  <p className="text-xs font-bold text-white">{theme.name}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: theme.accent }}
                    />
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div>
                <label htmlFor="invitation-headline" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Headline Title
                </label>
                <input
                  id="invitation-headline"
                  name="headline"
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label htmlFor="invitation-message" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Invitation Message
                </label>
                <textarea
                  id="invitation-message"
                  name="message"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500 leading-relaxed"
                />
              </div>

              <div>
                <label htmlFor="invitation-venue-address" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Venue & Address
                </label>
                <input
                  id="invitation-venue-address"
                  name="venueAddress"
                  type="text"
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label htmlFor="invitation-dress-code" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Dress Code
                </label>
                <input
                  id="invitation-dress-code"
                  name="dressCode"
                  type="text"
                  value={dressCode}
                  onChange={(e) => setDressCode(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="invitation-primary-color" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Primary Accent Color
                  </label>
                  <div className="flex items-center gap-2 bg-[#0B1020] border border-slate-700 rounded-xl px-2 py-1.5">
                    <input
                      id="invitation-primary-color"
                      name="primaryColor"
                      aria-label="Primary Accent Color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-300">{primaryColor}</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="invitation-accent-color" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Highlight Gold Color
                  </label>
                  <div className="flex items-center gap-2 bg-[#0B1020] border border-slate-700 rounded-xl px-2 py-1.5">
                    <input
                      id="invitation-accent-color"
                      name="accentColor"
                      aria-label="Highlight Gold Color"
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-300">{accentColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Typography Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "sans", label: "Modern Sans" },
                    { id: "serif", label: "Classic Serif" },
                    { id: "display", label: "Editorial" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFontStyle(f.id)}
                      className={`py-1.5 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                        fontStyle === f.id
                          ? "bg-violet-600 text-white border-violet-500"
                          : "bg-[#0B1020] text-slate-400 border-slate-700"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Live Interactive Card Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className="w-full max-w-lg">
            {/* Ambient decorative container */}
            <div
              className="relative rounded-3xl p-8 sm:p-12 shadow-2xl transition-all duration-300 border text-center overflow-hidden"
              style={{
                backgroundColor: "#0B1020",
                borderColor: primaryColor + "55",
                boxShadow: `0 20px 50px -15px ${primaryColor}33`,
              }}
            >
              {/* Subtle ornamental corners */}
              <div
                className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2"
                style={{ borderColor: accentColor }}
              />
              <div
                className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2"
                style={{ borderColor: accentColor }}
              />
              <div
                className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2"
                style={{ borderColor: accentColor }}
              />
              <div
                className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2"
                style={{ borderColor: accentColor }}
              />

              {/* Tagline */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest mb-6"
                style={{
                  backgroundColor: primaryColor + "20",
                  color: accentColor,
                  border: `1px solid ${accentColor}40`,
                }}
              >
                <span>Exclusive Invitation</span>
              </div>

              {/* Headline */}
              <h2
                className={`text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4 ${
                  fontStyle === "serif"
                    ? "font-serif"
                    : fontStyle === "display"
                    ? "font-mono uppercase tracking-wider"
                    : "font-sans"
                }`}
              >
                {headline}
              </h2>

              {/* Divider */}
              <div className="w-20 h-0.5 mx-auto my-6" style={{ backgroundColor: accentColor }} />

              {/* Message */}
              <p
                className={`text-xs sm:text-sm text-slate-300 leading-relaxed mb-8 max-w-md mx-auto ${
                  fontStyle === "serif" ? "font-serif italic" : "font-sans"
                }`}
              >
                {message}
              </p>

              {/* Event Location & Dress Code */}
              <div className="bg-[#171F35]/80 border border-slate-800 rounded-2xl p-4 text-xs space-y-2 mb-8">
                <p className="flex items-center justify-center gap-2 text-slate-200">
                  <MapPin className="w-4 h-4" style={{ color: primaryColor }} />
                  <span className="font-semibold">{venueAddress}</span>
                </p>
                {dressCode && (
                  <p className="text-[11px] text-slate-400">
                    <span className="font-bold text-slate-300">Dress Code: </span>
                    {dressCode}
                  </p>
                )}
              </div>

              {/* Digital Check-in QR Badge Simulator */}
              <div className="inline-flex flex-col items-center gap-2 p-3 bg-white rounded-2xl shadow-lg">
                <QrCode className="w-20 h-20 text-slate-900" />
                <span className="text-[9px] font-bold text-slate-700 tracking-wider uppercase">
                  VIP Secure Check-in QR
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
