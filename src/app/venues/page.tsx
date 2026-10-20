"use client";

import React, { useState, useEffect } from "react";
import {
  Compass,
  Search,
  MapPin,
  Users,
  DollarSign,
  Star,
  Heart,
  ShieldCheck,
  Check,
  Phone,
  Mail,
  ArrowRight,
  Filter,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Badge, Card, Modal } from "@/components/ui";
import { useEvent } from "@/context/EventContext";
import { useDebounce } from "@/hooks/useDebounce";
import { logger } from "@/lib/logger";
import type { VenueEntity } from "@/types";

export default function VenuesPage() {
  const { activeEvent } = useEvent();
  const [venues, setVenues] = useState<VenueEntity[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [minCapacity, setMinCapacity] = useState("0");
  const [maxPrice, setMaxPrice] = useState("20000");
  const [loading, setLoading] = useState(true);

  // Inquiry modal
  const [selectedVenue, setSelectedVenue] = useState<VenueEntity | null>(null);
  const [inquiryDate, setInquiryDate] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);

  const fetchVenues = async () => {
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (minCapacity !== "0") params.append("minCapacity", minCapacity);
      if (maxPrice) params.append("maxPrice", maxPrice);

      const res = await fetch(`/api/venues?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setVenues(data.venues || []);
      }
    } catch (e) {
      logger.error("Failed to fetch venues", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, [debouncedSearch, minCapacity, maxPrice]);

  const toggleFavorite = async (venueId: string) => {
    try {
      const res = await fetch("/api/venues/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueId }),
      });
      if (res.ok) {
        const data = await res.json();
        setVenues((prev) =>
          prev.map((v) =>
            v.id === venueId ? { ...v, isFavorite: data.isFavorited } : v
          )
        );
      }
    } catch (e) {
      logger.error("Failed to toggle favorite", e);
    }
  };

  const handleOpenInquiry = (venue: VenueEntity) => {
    setSelectedVenue(venue);
    setInquirySent(false);
    setInquiryMessage(
      `Hello ${venue.name} team, we are planning a celebration for approximately ${venue.capacity} attendees and would like to check availability and schedule a walkthrough.`
    );
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    setInquiryDate(defaultDate.toISOString().split("T")[0]);
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVenue) return;
    setSubmittingInquiry(true);

    try {
      // Simulate booking inquiry API call
      await new Promise((r) => setTimeout(r, 600));
      setInquirySent(true);
      setTimeout(() => {
        setSelectedVenue(null);
        setInquirySent(false);
      }, 1800);
    } catch (e) {
      logger.error("Failed to fetch venues", e);
    } finally {
      setSubmittingInquiry(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-900/40 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5 text-violet-400" />
            <span>Curated Venue Portfolio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Venue Discovery</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Discover verified architectural spaces, botanical lawns, and heritage pavilions with technical capacity specs.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#171F35] border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="venue-search-input"
              name="search"
              aria-label="Search venues by name, city, amenity"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, city, amenity..."
              className="w-full bg-[#0B1020] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="venue-min-capacity" className="text-xs font-semibold text-slate-400 shrink-0">Min Capacity:</label>
            <select
              id="venue-min-capacity"
              name="minCapacity"
              aria-label="Minimum Guest Capacity"
              value={minCapacity}
              onChange={(e) => setMinCapacity(e.target.value)}
              className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
            >
              <option value="0">Any Capacity</option>
              <option value="150">150+ Guests</option>
              <option value="300">300+ Guests</option>
              <option value="500">500+ Guests</option>
              <option value="750">750+ Guests</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="venue-max-price" className="text-xs font-semibold text-slate-400 shrink-0">Max Day Rate:</label>
            <select
              id="venue-max-price"
              name="maxPrice"
              aria-label="Maximum Day Rate"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
            >
              <option value="20000">Up to $20,000</option>
              <option value="10000">Up to $10,000</option>
              <option value="6000">Up to $6,000</option>
              <option value="4000">Up to $4,000</option>
            </select>
          </div>
        </div>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <div
              key={venue.id}
              className="bg-[#171F35] border border-slate-800 rounded-2xl overflow-hidden hover:border-violet-500/40 transition-all flex flex-col justify-between group shadow-xl"
            >
              <div className="relative h-52 w-full bg-slate-900 overflow-hidden">
                <img
                  src={venue.imageUrl || "/placeholder.jpg"}
                  alt={venue.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171F35] via-transparent to-black/30" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {venue.isVerified && (
                    <Badge variant="success" className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Venue</span>
                    </Badge>
                  )}
                  {venue.isDemo && (
                    <Badge variant="neutral">Demo Record</Badge>
                  )}
                </div>

                {/* Favorite Heart Button */}
                <button
                  onClick={() => toggleFavorite(venue.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:text-rose-400 transition-colors cursor-pointer"
                  title="Save to Favorites"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      venue.isFavorited ? "fill-rose-500 text-rose-500" : ""
                    }`}
                  />
                </button>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold">{venue.rating}</span>
                  </div>
                  <div className="bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-sm font-semibold text-amber-300">
                    ${venue.pricePerDay.toLocaleString()} / day
                  </div>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                    {venue.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <span className="truncate">{venue.location}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Up to {venue.capacity} guests</span>
                  </p>

                  {/* Amenities Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {venue.amenitiesList?.slice(0, 3).map((am: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-[#0B1020] border border-slate-800 text-[10px] text-slate-300 font-medium"
                      >
                        ✓ {am}
                      </span>
                    ))}
                    {venue.amenitiesList && venue.amenitiesList.length > 3 && (
                      <span className="px-2 py-0.5 rounded-md bg-[#0B1020] border border-slate-800 text-[10px] text-slate-500">
                        +{venue.amenitiesList.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenInquiry(venue)}
                    className="w-full text-xs shadow-md"
                  >
                    <span>Send Booking Inquiry</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Inquiry Modal */}
        {selectedVenue && (
          <Modal
            isOpen={Boolean(selectedVenue)}
            onClose={() => setSelectedVenue(null)}
            title={`Venue Inquiry: ${selectedVenue.name}`}
            description="Submit an official inquiry directly to the facility manager."
          >
            {inquirySent ? (
              <div className="text-center py-6 space-y-2">
                <Check className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">Inquiry Dispatched!</h3>
                <p className="text-xs text-slate-400">
                  The venue manager has received your request and dates.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-4">
                <div>
                  <label htmlFor="venue-inquiry-date" className="block text-xs font-semibold text-slate-300 mb-1">
                    Proposed Date
                  </label>
                  <input
                    id="venue-inquiry-date"
                    name="inquiryDate"
                    type="date"
                    required
                    value={inquiryDate}
                    onChange={(e) => setInquiryDate(e.target.value)}
                    className="w-full bg-[#0B1020] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label htmlFor="venue-inquiry-message" className="block text-xs font-semibold text-slate-300 mb-1">
                    Inquiry Message & Requirements
                  </label>
                  <textarea
                    id="venue-inquiry-message"
                    name="inquiryMessage"
                    rows={4}
                    required
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="w-full bg-[#0B1020] border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500 leading-relaxed"
                  />
                </div>

                <div className="bg-[#11182B] p-3 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                  <p className="text-slate-300 font-semibold">Contact Coordination:</p>
                  <p>Email: {selectedVenue.contactEmail}</p>
                  <p>Phone: {selectedVenue.contactPhone}</p>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedVenue(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={submittingInquiry}
                  >
                    {submittingInquiry ? "Dispatching..." : "Send Inquiry"}
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
