import { EventOverviewClient } from "@/components/events/EventOverviewClient";

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventOverviewClient eventId={id} />;
}
