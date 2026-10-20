"use client";

import React, { useState, useEffect } from "react";
import {
  Store,
  Search,
  Star,
  MapPin,
  ShieldCheck,
  Check,
  DollarSign,
  ArrowRight,
  Send,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Badge, Card, Modal } from "@/components/ui";
import { useEvent } from "@/context/EventContext";
import { useDebounce } from "@/hooks/useDebounce";
import { logger } from "@/lib/logger";
import type { VendorEntity } from "@/types";

const categories = [
  { id: "all", label: "All Categories" },
  { id: "decorator", label: "Decorators" },
  { id: "caterer", label: "Caterers" },
  { id: "photographer", label: "Photographers" },
  { id: "entertainer", label: "Live Bands & DJs" },
  { id: "florist", label: "Floral Designers" },
  { id: "event_manager", label: "Event Directors" },
];

export default function VendorsPage() {
  const { activeEvent } = useEvent();
  const [vendors, setVendors] = useState<VendorEntity[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [loading, setLoading] = useState(true);

  // Inquiry form modal
  const [selectedVendor, setSelectedVendor] = useState<VendorEntity | null>(null);
  const [inquiryBudget, setInquiryBudget] = useState("");
  const [inquiryDate, setInquiryDate] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  const fetchVendors = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (debouncedSearch) params.append("search", debouncedSearch);

      const res = await fetch(`/api/vendors?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setVendors(data.vendors || []);
      }
    } catch (e) {
      logger.error("Failed to fetch vendors", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [selectedCategory, debouncedSearch]);

  const handleOpenInquiry = (v: VendorEntity) => {
    setSelectedVendor(v);
    setInquiryBudget(v.startingPrice.toString());
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    setInquiryDate(defaultDate.toISOString().split("T")[0]);
    setInquiryMessage(
      `Hello ${v.name}, we would like to book your services for our upcoming celebration. Please share your availability and contract options.`
    );
    setInquirySuccess(false);
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor || !activeEvent) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/vendors/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: selectedVendor.id,
          eventId: activeEvent.id,
          budget: Number(inquiryBudget),
          dateNeeded: inquiryDate,
          message: inquiryMessage,
        }),
      });

      if (res.ok) {
        setInquirySuccess(true);
        setTimeout(() => {
          setSelectedVendor(null);
          setInquirySuccess(false);
        }, 1800);
      }
    } catch (e) {
      logger.error("Failed to fetch vendors", e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-900/40 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-2">
            <Store className="w-3.5 h-3.5 text-violet-400" />
            <span>Vetted Celebration Artisans</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Vendor Marketplace</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse award-winning caterers, kinetic stage decorators, documentary photographers, and entertainers.
          </p>
        </div>

        {/* Categories and Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === c.id
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-[#171F35] text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by vendor name..."
              className="w-full bg-[#171F35] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-[#171F35] border border-slate-800 rounded-2xl overflow-hidden hover:border-violet-500/40 transition-all flex flex-col justify-between group shadow-xl"
            >
              <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                <img
                  src={vendor.imageUrl || "/placeholder.jpg"}
                  alt={vendor.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171F35] via-transparent to-black/30" />

                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant="violet" className="capitalize">
                    {vendor.category.replace("_", " ")}
                  </Badge>
                  {vendor.isVerified && (
                    <Badge variant="success" className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified</span>
                    </Badge>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold">{vendor.rating}</span>
                    <span className="text-[10px] text-slate-400">({vendor.reviewCount})</span>
                  </div>
                  <div className="bg-black/60 px-2 py-0.5 rounded-lg backdrop-blur-sm font-semibold text-amber-300">
                    From ${vendor.startingPrice.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                    {vendor.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <span>{vendor.location}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {vendor.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenInquiry(vendor)}
                    className="w-full text-xs shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Service Inquiry</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Inquiry Modal */}
        {selectedVendor && (
          <Modal
            isOpen={Boolean(selectedVendor)}
            onClose={() => setSelectedVendor(null)}
            title={`Submit Inquiry: ${selectedVendor.name}`}
            description="Directly reach out with dates and budget parameters."
          >
            {inquirySuccess ? (
              <div className="text-center py-6 space-y-2">
                <Check className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">Inquiry Dispatched!</h3>
                <p className="text-xs text-slate-400">
                  {selectedVendor.name} received your request and will follow up shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Event Date Needed
                    </label>
                    <input
                      type="date"
                      required
                      value={inquiryDate}
                      onChange={(e) => setInquiryDate(e.target.value)}
                      className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Estimated Budget ($)
                    </label>
                    <input
                      type="number"
                      required
                      value={inquiryBudget}
                      onChange={(e) => setInquiryBudget(e.target.value)}
                      className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Requirements & Brief
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="w-full bg-[#0B1020] border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500 leading-relaxed"
                  />
                </div>

                <div className="bg-[#11182B] p-3 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                  <p className="text-slate-300 font-semibold">Vendor Direct Channels:</p>
                  <p>Email: {selectedVendor.contactEmail}</p>
                  <p>Phone: {selectedVendor.contactPhone}</p>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedVendor(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Send Inquiry"}
                  </Button>
                </div>
              </form>
            )}
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
