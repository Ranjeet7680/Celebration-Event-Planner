"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GuestManager } from "@/components/guests/GuestManager";
import { useEvent } from "@/context/EventContext";

export default function GlobalGuestsPage() {
  const { activeEvent } = useEvent();

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <GuestManager eventId={activeEvent?.id} />
      </div>
    </AppShell>
  );
}
