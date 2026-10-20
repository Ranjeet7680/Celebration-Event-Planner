"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { BudgetPlannerView } from "@/components/budget/BudgetPlannerView";
import { useEvent } from "@/context/EventContext";

export default function GlobalBudgetPage() {
  const { activeEvent } = useEvent();

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <BudgetPlannerView eventId={activeEvent?.id} />
      </div>
    </AppShell>
  );
}
