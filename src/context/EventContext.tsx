"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface EventSummary {
  id: string;
  title: string;
  category: string;
  eventDate: string;
  budget: number;
  currency: string;
  location: string;
  status: string;
  coverImage?: string;
  guestsCount?: number;
  tasksCount?: number;
}

interface EventContextType {
  activeEventId: string | null;
  setActiveEventId: (id: string) => void;
  events: EventSummary[];
  activeEvent: EventSummary | null;
  refreshEvents: () => Promise<void>;
  loading: boolean;
}

const EventContext = createContext<EventContextType>({
  activeEventId: null,
  setActiveEventId: () => {},
  events: [],
  activeEvent: null,
  refreshEvents: async () => {},
  loading: true,
});

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        const evs = data.events || [];
        setEvents(evs);
        if (evs.length > 0 && !activeEventId) {
          // Check localStorage or default to first
          const saved = typeof window !== "undefined" ? localStorage.getItem("promptwars_active_event") : null;
          if (saved && evs.some((e: EventSummary) => e.id === saved)) {
            setActiveEventId(saved);
          } else {
            setActiveEventId(evs[0].id);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load events in context:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSetActiveEvent = (id: string) => {
    setActiveEventId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("promptwars_active_event", id);
    }
  };

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0] || null;

  return (
    <EventContext.Provider
      value={{
        activeEventId: activeEvent?.id || null,
        setActiveEventId: handleSetActiveEvent,
        events,
        activeEvent,
        refreshEvents: fetchEvents,
        loading,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  return useContext(EventContext);
}
