import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search") || "";

    const templates = await prisma.eventTemplate.findMany({
      where: {
        AND: [
          category && category !== "all" ? { category } : {},
          search
            ? {
                OR: [
                  { title: { contains: search } },
                  { description: { contains: search } },
                  { tags: { contains: search } },
                ],
              }
            : {},
        ],
      },
      orderBy: { isFavorite: "desc" },
    });

    const formatted = templates.map((t) => ({
      ...t,
      tagsList: JSON.parse(t.tags || "[]"),
    }));

    return NextResponse.json(
      { templates: formatted, count: formatted.length },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    logger.error("Fetch templates error", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
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

    const { templateId, customTitle, eventDate } = await request.json();

    const template = await prisma.eventTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const event = await prisma.event.create({
      data: {
        userId: user.id,
        title: customTitle || template.title,
        description: template.description,
        category: template.category,
        eventDate: eventDate ? new Date(eventDate) : new Date(Date.now() + 30 * 86400000),
        location: "To be decided",
        estimatedGuests: template.guestCount,
        budget: template.estimatedBudget,
        currency: "USD",
        coverImage: template.coverImage,
        tags: template.tags,
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
            totalBudget: template.estimatedBudget,
            allocatedBudget: template.estimatedBudget,
            currency: "USD",
          },
        },
      },
    });

    // Create starter tasks
    await prisma.task.createMany({
      data: [
        {
          eventId: event.id,
          title: `Lock in venue for ${event.title}`,
          category: "Venue",
          priority: "urgent",
          status: "todo",
        },
        {
          eventId: event.id,
          title: "Select primary catering & beverage partner",
          category: "Catering",
          priority: "high",
          status: "todo",
        },
        {
          eventId: event.id,
          title: "Design invitation and open digital guest registration",
          category: "Guest Experience",
          priority: "medium",
          status: "todo",
        },
      ],
    });

    await prisma.activityLog.create({
      data: {
        eventId: event.id,
        userId: user.id,
        action: "Created from Template",
        details: `Created new event from template: "${template.title}"`,
      },
    });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    logger.error("Create from template error", error);
    return NextResponse.json(
      { error: "Failed to create event from template" },
      { status: 500 }
    );
  }
}

