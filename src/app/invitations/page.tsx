"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { InvitationDesigner } from "@/components/invitations/InvitationDesigner";
import { useEvent } from "@/context/EventContext";

export default function GlobalInvitationsPage() {
  const { activeEvent } = useEvent();

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <InvitationDesigner eventId={activeEvent?.id} />
      </div>
    </AppShell>
  );
}
