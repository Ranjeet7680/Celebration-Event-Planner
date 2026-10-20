import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        collaborators: true,
        tasks: { orderBy: { createdAt: "desc" } },
        guests: { orderBy: { name: "asc" } },
        budgetSummary: {
          include: {
            categories: true,
          },
        },
        expenses: { orderBy: { date: "desc" } },
        invitations: true,
        moodboards: {
          include: {
            items: true,
          },
        },
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 15,
        },
        plans: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Permission check: owner, collaborator, or demo event
    const isOwner = event.userId === user.id;
    const isCollaborator = event.collaborators.some((c) => c.userId === user.id);
    if (!isOwner && !isCollaborator && !event.isDemo) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Error fetching event details:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: { collaborators: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Must be owner or editor/admin
    const userCollab = event.collaborators.find((c) => c.userId === user.id);
    const canEdit =
      event.userId === user.id ||
      (userCollab && ["owner", "admin", "editor"].includes(userCollab.role)) ||
      event.isDemo;

    if (!canEdit) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      eventDate,
      endDate,
      location,
      venueId,
      estimatedGuests,
      budget,
      currency,
      status,
      coverImage,
    } = body;

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(eventDate !== undefined && { eventDate: new Date(eventDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(location !== undefined && { location }),
        ...(venueId !== undefined && { venueId: venueId || null }),
        ...(estimatedGuests !== undefined && { estimatedGuests: Number(estimatedGuests) }),
        ...(budget !== undefined && { budget: Number(budget) }),
        ...(currency !== undefined && { currency }),
        ...(status !== undefined && { status }),
        ...(coverImage !== undefined && { coverImage }),
      },
    });

    await prisma.activityLog.create({
      data: {
        eventId: id,
        userId: user.id,
        action: "Event Updated",
        details: `Updated details for "${updatedEvent.title}"`,
      },
    });

    return NextResponse.json({ success: true, event: updatedEvent });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: { collaborators: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Owner permission required to delete
    if (event.userId !== user.id && !event.isDemo) {
      return NextResponse.json(
        { error: "Only the event owner can delete this event" },
        { status: 403 }
      );
    }

    await prisma.event.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
