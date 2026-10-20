import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sanitizePlainString } from "@/lib/sanitize";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const take = Math.min(Math.max(1, Number(searchParams.get("take")) || 50), 100);
    const skip = Math.max(0, Number(searchParams.get("skip")) || 0);
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    const whereClause: Record<string, unknown> = {
      OR: [
        { userId: user.id },
        { collaborators: { some: { userId: user.id } } },
        { isDemo: true },
      ],
    };

    if (category) {
      whereClause.category = category;
    }
    if (status) {
      whereClause.status = status;
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        tasks: { select: { id: true, status: true, priority: true } },
        guests: { select: { id: true, rsvpStatus: true, plusOne: true } },
        expenses: { select: { id: true, amount: true, status: true } },
        collaborators: true,
      },
      orderBy: { eventDate: "asc" },
      take,
      skip,
    });

    return NextResponse.json(
      { events, count: events.length },
      {
        headers: {
          "Cache-Control": "private, no-cache",
        },
      }
    );
  } catch (error) {
    logger.error("Error fetching events", error);
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

    const body = await request.json().catch(() => ({}));
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

    const cleanTitle = sanitizePlainString(title);
    const cleanLocation = sanitizePlainString(location);
    const cleanDescription = description ? sanitizePlainString(description) : "";

    if (!cleanTitle || !eventDate || !cleanLocation) {
      return NextResponse.json(
        { error: "Title, event date, and location are required" },
        { status: 400 }
      );
    }

    const numBudget = Number(budget);
    if (isNaN(numBudget) || numBudget < 0) {
      return NextResponse.json(
        { error: "Budget must be a non-negative number" },
        { status: 400 }
      );
    }

    const numGuests = Number(estimatedGuests);
    if (isNaN(numGuests) || numGuests < 1) {
      return NextResponse.json(
        { error: "Estimated guests must be at least 1" },
        { status: 400 }
      );
    }

    const parsedDate = new Date(eventDate);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Please provide a valid ISO date for the event" },
        { status: 400 }
      );
    }

    const newEvent = await prisma.event.create({
      data: {
        userId: user.id,
        title: cleanTitle,
        description: cleanDescription,
        category: category || "General",
        eventDate: parsedDate,
        endDate: endDate ? new Date(endDate) : null,
        location: cleanLocation,
        venueId: venueId || null,
        estimatedGuests: numGuests,
        budget: numBudget,
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
            totalBudget: numBudget,
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
    logger.error("Error creating event", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
