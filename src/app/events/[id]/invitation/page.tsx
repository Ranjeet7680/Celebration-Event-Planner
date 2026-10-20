import { AppShell } from "@/components/layout/AppShell";
import { InvitationDesigner } from "@/components/invitations/InvitationDesigner";

export default async function EventInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <InvitationDesigner eventId={id} />
      </div>
    </AppShell>
  );
}
