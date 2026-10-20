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
    const guests = await prisma.guest.findMany({
      where: { eventId: id },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ guests });
  } catch (error) {
    console.error("Fetch guests error:", error);
    return NextResponse.json(
      { error: "Failed to fetch guests" },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const { name, email, phone, group, rsvpStatus, dietaryRestrictions, plusOne, notes } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Guest name is required" }, { status: 400 });
    }

    const guest = await prisma.guest.create({
      data: {
        eventId: id,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        group: group || "Friends",
        rsvpStatus: rsvpStatus || "pending",
        invitationStatus: "sent",
        dietaryRestrictions: dietaryRestrictions || null,
        plusOne: Number(plusOne) || 0,
        notes: notes || null,
      },
    });

    await prisma.activityLog.create({
      data: {
        eventId: id,
        userId: user.id,
        action: "Guest Added",
        details: `Added ${guest.name} (${guest.group}) with status: ${guest.rsvpStatus}`,
      },
    });

    return NextResponse.json({ success: true, guest }, { status: 201 });
  } catch (error) {
    console.error("Create guest error:", error);
    return NextResponse.json(
      { error: "Failed to add guest" },
      { status: 500 }
    );
  }
}
