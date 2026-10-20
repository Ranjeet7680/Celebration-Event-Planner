import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sanitizePlainString } from "@/lib/sanitize";
import { logger } from "@/lib/logger";

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

    return NextResponse.json(
      { guests, count: guests.length },
      {
        headers: {
          "Cache-Control": "private, no-cache",
        },
      }
    );
  } catch (error) {
    logger.error("Fetch guests error", error);
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
    const body = await request.json().catch(() => ({}));
    const { name, email, phone, group, rsvpStatus, dietaryRestrictions, plusOne, notes } = body;

    const cleanName = sanitizePlainString(name);
    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json({ error: "Guest name is required (minimum 2 characters)" }, { status: 400 });
    }

    const cleanEmail = email ? String(email).trim().toLowerCase() : null;
    const cleanPhone = phone ? sanitizePlainString(phone) : null;
    const cleanGroup = group ? sanitizePlainString(group) : "Friends";
    const cleanDietary = dietaryRestrictions ? sanitizePlainString(dietaryRestrictions) : null;
    const cleanNotes = notes ? sanitizePlainString(notes) : null;
    const cleanPlusOne = Math.max(0, Math.min(10, Number(plusOne) || 0));

    const guest = await prisma.guest.create({
      data: {
        eventId: id,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        group: cleanGroup,
        rsvpStatus: rsvpStatus || "pending",
        invitationStatus: "sent",
        dietaryRestrictions: cleanDietary,
        plusOne: cleanPlusOne,
        notes: cleanNotes,
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
    logger.error("Create guest error", error);
    return NextResponse.json(
      { error: "Failed to add guest" },
      { status: 500 }
    );
  }
}
