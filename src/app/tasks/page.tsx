"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TaskKanbanView } from "@/components/tasks/TaskKanbanView";
import { useEvent } from "@/context/EventContext";

export default function GlobalTasksPage() {
  const { activeEvent } = useEvent();

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <TaskKanbanView eventId={activeEvent?.id} />
      </div>
    </AppShell>
  );
}
