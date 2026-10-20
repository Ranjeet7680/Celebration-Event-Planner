import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { FullEventPlanSchema, GeneratedEventPlan } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan, prompt, isDemoMode } = body as {
      plan: GeneratedEventPlan;
      prompt: string;
      isDemoMode?: boolean;
    };

    if (!plan || !prompt) {
      return NextResponse.json(
        { error: "Plan data and prompt are required" },
        { status: 400 }
      );
    }

    const validatedPlan = FullEventPlanSchema.parse(plan);

    // Pick a high quality stock cover photo based on category
    let coverImage =
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80";
    if (validatedPlan.category.toLowerCase().includes("wedding")) {
      coverImage =
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80";
    } else if (validatedPlan.category.toLowerCase().includes("birthday")) {
      coverImage =
        "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80";
    } else if (validatedPlan.category.toLowerCase().includes("corporate") || validatedPlan.category.toLowerCase().includes("tech")) {
      coverImage =
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80";
    } else if (validatedPlan.category.toLowerCase().includes("cultural") || validatedPlan.category.toLowerCase().includes("festival")) {
      coverImage =
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80";
    }

    // Parse event date
    let eventDate = new Date();
    try {
      if (validatedPlan.proposedDate) {
        eventDate = new Date(validatedPlan.proposedDate);
      } else {
        eventDate.setDate(eventDate.getDate() + 30);
      }
    } catch {
      eventDate.setDate(eventDate.getDate() + 30);
    }

    // 1. Create the Event
    const newEvent = await prisma.event.create({
      data: {
        userId: user.id,
        title: validatedPlan.eventName,
        description: `${validatedPlan.tagline}\n\n${validatedPlan.description}`,
        category: validatedPlan.category,
        eventDate,
        location: validatedPlan.proposedLocation,
        estimatedGuests: validatedPlan.estimatedGuests,
        budget: validatedPlan.totalEstimatedBudget,
        currency: validatedPlan.currency,
        status: "planned",
        coverImage,
        tags: JSON.stringify([validatedPlan.category, validatedPlan.duration, `${validatedPlan.estimatedGuests} guests`]),
        collaborators: {
          create: {
            userId: user.id,
            name: user.name,
            email: user.email,
            role: "owner",
            status: "active",
          },
        },
      },
    });

    // 2. Save the EventPlan record
    await prisma.eventPlan.create({
      data: {
        eventId: newEvent.id,
        prompt,
        rawJson: JSON.stringify(validatedPlan),
        planSummary: validatedPlan.tagline,
        isGeneratedByAi: true,
        isDemoMode: Boolean(isDemoMode),
      },
    });

    // 3. Create Tasks from taskChecklist
    if (validatedPlan.taskChecklist && validatedPlan.taskChecklist.length > 0) {
      await prisma.task.createMany({
        data: validatedPlan.taskChecklist.map((task, idx) => ({
          eventId: newEvent.id,
          title: task.title,
          description: task.description || "",
          category: task.category,
          priority: task.priority || "medium",
          status: "todo",
          order: idx,
        })),
      });
    }

    // 4. Create Budget & Categories from budgetBreakdown
    const allocatedSum = validatedPlan.budgetBreakdown.reduce(
      (sum, item) => sum + item.allocatedAmount,
      0
    );

    const paletteColors = [
      "#6366F1",
      "#8B5CF6",
      "#F5C76B",
      "#EC4899",
      "#10B981",
      "#3B82F6",
      "#F97316",
    ];

    await prisma.budget.create({
      data: {
        eventId: newEvent.id,
        totalBudget: validatedPlan.totalEstimatedBudget,
        allocatedBudget: allocatedSum,
        currency: validatedPlan.currency,
        notes: `AI Generated Allocation based on ${validatedPlan.estimatedGuests} guests.`,
        categories: {
          create: validatedPlan.budgetBreakdown.map((item, idx) => ({
            name: item.category,
            allocatedAmount: item.allocatedAmount,
            color: paletteColors[idx % paletteColors.length],
          })),
        },
      },
    });

    // 5. Create starter Invitation
    await prisma.invitation.create({
      data: {
        eventId: newEvent.id,
        headline: validatedPlan.eventName,
        message: validatedPlan.tagline,
        venueAddress: validatedPlan.proposedLocation,
        primaryColor: "#8B5CF6",
        accentColor: "#F5C76B",
        fontStyle: "sans",
        isPublished: false,
      },
    });

    // 6. Log Activity
    await prisma.activityLog.create({
      data: {
        eventId: newEvent.id,
        userId: user.id,
        action: "AI Plan Applied",
        details: `Saved AI Event Plan: generated ${validatedPlan.taskChecklist.length} tasks and ${validatedPlan.budgetBreakdown.length} budget categories.`,
      },
    });

    // 7. Create In-App Notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "AI Event Plan Ready!",
        message: `"${validatedPlan.eventName}" was successfully created with tasks and budget allocations.`,
        type: "system",
        link: `/events/${newEvent.id}`,
      },
    });

    return NextResponse.json({
      success: true,
      eventId: newEvent.id,
      event: newEvent,
    });
  } catch (error) {
    console.error("Save AI Plan Error:", error);
    return NextResponse.json(
      { error: "Failed to convert AI plan into event" },
      { status: 500 }
    );
  }
}

