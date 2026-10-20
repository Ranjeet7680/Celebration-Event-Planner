import { AppShell } from "@/components/layout/AppShell";
import { GuestManager } from "@/components/guests/GuestManager";

export default async function EventGuestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <GuestManager eventId={id} />
      </div>
    </AppShell>
  );
}
