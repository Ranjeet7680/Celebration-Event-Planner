import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";


export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = await prisma.event.findMany({
      where: {
        OR: [
          { userId: user.id },
          { collaborators: { some: { userId: user.id } } },
          { isDemo: true },
        ],
      },
      include: {
        tasks: { select: { id: true, status: true, priority: true } },
        guests: { select: { id: true, rsvpStatus: true, plusOne: true } },
        expenses: { select: { id: true, amount: true, status: true } },
        collaborators: true,
      },
      orderBy: { eventDate: "asc" },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    if (!title || !eventDate || !location) {
      return NextResponse.json(
        { error: "Title, event date, and location are required" },
        { status: 400 }
      );
    }

    const newEvent = await prisma.event.create({
      data: {
        userId: user.id,
        title,
        description: description || "",
        category: category || "General",
        eventDate: new Date(eventDate),
        endDate: endDate ? new Date(endDate) : null,
        location,
        venueId: venueId || null,
        estimatedGuests: Number(estimatedGuests) || 50,
        budget: Number(budget) || 0,
        currency: currency || "USD",
        status: status || "planned",
        coverImage:
          coverImage ||
          "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
        collaborators: {
          create: {
            userId: user.id,
            name: user.name,
            email: user.email,
            role: "owner",
            status: "active",
          },
        },
        budgetSummary: {
          create: {
            totalBudget: Number(budget) || 0,
            allocatedBudget: 0,
            currency: currency || "USD",
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        eventId: newEvent.id,
        userId: user.id,
        action: "Event Created",
        details: `Created "${newEvent.title}" with budget of ${newEvent.currency} ${newEvent.budget}`,
      },
    });

    return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

