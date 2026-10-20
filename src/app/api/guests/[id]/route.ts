import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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
    const body = await request.json();

    const existingGuest = await prisma.guest.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!existingGuest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    const updated = await prisma.guest.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.group !== undefined && { group: body.group }),
        ...(body.rsvpStatus !== undefined && { rsvpStatus: body.rsvpStatus }),
        ...(body.invitationStatus !== undefined && { invitationStatus: body.invitationStatus }),
        ...(body.dietaryRestrictions !== undefined && { dietaryRestrictions: body.dietaryRestrictions }),
        ...(body.plusOne !== undefined && { plusOne: Number(body.plusOne) }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });

    // If RSVP changed, create in-app notification
    if (body.rsvpStatus && body.rsvpStatus !== existingGuest.rsvpStatus) {
      await prisma.notification.create({
        data: {
          userId: existingGuest.event.userId,
          title: "RSVP Status Updated",
          message: `${updated.name} changed status to: ${updated.rsvpStatus}`,
          type: "rsvp",
          link: `/events/${existingGuest.eventId}/guests`,
        },
      });
    }

    return NextResponse.json({ success: true, guest: updated });
  } catch (error) {
    console.error("Update guest error:", error);
    return NextResponse.json(
      { error: "Failed to update guest" },
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
    await prisma.guest.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete guest error:", error);
    return NextResponse.json(
      { error: "Failed to delete guest" },
      { status: 500 }
    );
  }
}
