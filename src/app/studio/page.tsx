"use client";

import React, { useState, useEffect } from "react";
import {
  Palette,
  Sparkles,
  Plus,
  Check,
  Copy,
  Image as ImageIcon,
  Layers,
  Heart,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Badge, Card, Modal } from "@/components/ui";
import { useEvent } from "@/context/EventContext";

const samplePalettes = [
  { name: "Kolkata Spring Festive", colors: ["#8B5CF6", "#6366F1", "#F5C76B", "#10B981", "#FB7185"] },
  { name: "Royal Rajasthan Heritage", colors: ["#7C2D12", "#D97706", "#F5C76B", "#1E3A8A", "#047857"] },
  { name: "Midnight Celestial Glow", colors: ["#0B1020", "#1E1B4B", "#6366F1", "#A78BFA", "#F5C76B"] },
  { name: "Botanical Glasshouse Emerald", colors: ["#064E3B", "#059669", "#34D399", "#FDE68A", "#F8FAFC"] },
];

const sampleInspirations = [
  {
    id: "1",
    title: "Terracotta Fairy-Light Canopies",
    category: "Lighting",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
    notes: "Suspended 15ft above the central lawn with warm 2700K bulbs.",
  },
  {
    id: "2",
    title: "Sculptural Marigold Floral Wall",
    category: "Floral",
    imageUrl: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80",
    notes: "Selfie backdrop near registration terminal with branded neon sign.",
  },
  {
    id: "3",
    title: "Kinetic LED Stage Trussing",
    category: "Decor",
    imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80",
    notes: "Sound-synchronized laser array and geometric ceiling chandeliers.",
  },
  {
    id: "4",
    title: "Artisanal Clay Kulhad Tea & Dessert Bar",
    category: "Catering & Cake",
    imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80",
    notes: "Interactive live station with copper kettle accents and organic sweets.",
  },
  {
    id: "5",
    title: "Candlelit Royal Mirror Courtyard",
    category: "Decor",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
    notes: "Reflecting pools with floating lotus blossoms and brass diya lamps.",
  },
  {
    id: "6",
    title: "Cyber-Chic Rooftop Neon Lounge",
    category: "Lighting",
    imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80",
    notes: "Smoked glass high-tops, violet LED ribbons, and plush velvet banquettes.",
  },
];

export default function ThemeStudioPage() {
  const { activeEvent } = useEvent();
  const [activePaletteIndex, setActivePaletteIndex] = useState(0);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [items, setItems] = useState(sampleInspirations);
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Add Item Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [itemTitle, setItemTitle] = useState("");
  const [itemCategory, setItemCategory] = useState("Decor");
  const [itemImageUrl, setItemImageUrl] = useState("");
  const [itemNotes, setItemNotes] = useState("");

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle || !itemImageUrl) return;

    const newItem = {
      id: Date.now().toString(),
      title: itemTitle,
      category: itemCategory,
      imageUrl: itemImageUrl,
      notes: itemNotes,
    };

    setItems([newItem, ...items]);
    setItemTitle("");
    setItemImageUrl("");
    setItemNotes("");
    setAddModalOpen(false);
  };

  const filteredItems = items.filter(
    (item) => categoryFilter === "all" || item.category === categoryFilter
  );

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-900/40 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-2">
              <Palette className="w-3.5 h-3.5 text-violet-400" />
              <span>Spatial Design & Aesthetic Moodboards</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Theme & Decoration Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Curate visual inspiration, generate harmonic color palettes, and organize spatial moodboards for your decor teams.
            </p>
          </div>

          <Button variant="primary" size="sm" onClick={() => setAddModalOpen(true)}>
            <Plus className="w-4 h-4" />
            <span>Add Inspiration</span>
          </Button>
        </div>

        {/* Color Palette Selector */}
        <Card className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Harmonic Color Swatches</span>
              </h3>
              <p className="text-xs text-slate-400">Click any color swatch to copy its HEX code</p>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {samplePalettes.map((pal, idx) => (
                <button
                  key={pal.name}
                  onClick={() => setActivePaletteIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activePaletteIndex === idx
                      ? "bg-violet-600 text-white shadow"
                      : "bg-[#0B1020] text-slate-400 hover:text-white border border-slate-700"
                  }`}
                >
                  {pal.name}
                </button>
              ))}
            </div>
          </div>

          {/* Swatches Bar */}
          <div className="grid grid-cols-5 gap-3 pt-2">
            {samplePalettes[activePaletteIndex].colors.map((color) => (
              <button
                key={color}
                onClick={() => copyToClipboard(color)}
                className="h-24 sm:h-28 rounded-2xl p-3 flex flex-col justify-between text-left transition-all hover:scale-105 relative border border-white/10 group cursor-pointer shadow-lg"
                style={{ backgroundColor: color }}
              >
                <div className="flex justify-end">
                  <div className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {copiedColor === color ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-white font-mono text-[11px] font-bold inline-block self-start">
                  {copiedColor === color ? "COPIED!" : color}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {["all", "Lighting", "Floral", "Decor", "Catering & Cake"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                categoryFilter === cat
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-[#171F35] text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {cat === "all" ? "All Inspirations" : cat}
            </button>
          ))}
        </div>

        {/* Moodboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#171F35] border border-slate-800 rounded-2xl overflow-hidden hover:border-violet-500/40 transition-all flex flex-col justify-between group shadow-xl"
            >
              <div className="relative h-56 w-full bg-slate-900 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171F35] via-transparent to-black/30" />
                <div className="absolute top-3 left-3">
                  <Badge variant="violet">{item.category}</Badge>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {item.notes}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span>Curated for {activeEvent?.title || "Active Project"}</span>
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500/30" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Modal */}
        {addModalOpen && (
          <Modal
            isOpen={addModalOpen}
            onClose={() => setAddModalOpen(false)}
            title="Add Moodboard Inspiration"
            description="Attach a design idea or photo reference to your event theme."
          >
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  placeholder="e.g. Terracotta Lantern Canopy"
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Decor">Decor</option>
                  <option value="Lighting">Lighting</option>
                  <option value="Floral">Floral</option>
                  <option value="Catering & Cake">Catering & Cake</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  required
                  value={itemImageUrl}
                  onChange={(e) => setItemImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Design Notes & Placement
                </label>
                <textarea
                  rows={2}
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  placeholder="Installation height, lighting color, vendor instructions..."
                  className="w-full bg-[#0B1020] border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Inspiration
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
