import { AppShell } from "@/components/layout/AppShell";
import { TaskKanbanView } from "@/components/tasks/TaskKanbanView";

export default async function EventTasksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <TaskKanbanView eventId={id} />
      </div>
    </AppShell>
  );
}
