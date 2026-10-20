import { AppShell } from "@/components/layout/AppShell";
import { BudgetPlannerView } from "@/components/budget/BudgetPlannerView";

export default async function EventBudgetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <BudgetPlannerView eventId={id} />
      </div>
    </AppShell>
  );
}
