import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";


export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    // Fetch user events
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { userId: user.id },
          { collaborators: { some: { userId: user.id } } },
          { isDemo: true },
        ],
      },
      include: {
        guests: true,
        tasks: true,
        expenses: true,
        budgetSummary: {
          include: { categories: true },
        },
      },
    });

    const targetEvents = eventId
      ? events.filter((e) => e.id === eventId)
      : events;

    // Aggregate metrics
    let totalBudget = 0;
    let totalSpent = 0;
    let totalGuests = 0;
    let attendingGuests = 0;
    let declinedGuests = 0;
    let tentativeGuests = 0;
    let pendingGuests = 0;
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let todoTasks = 0;

    const categorySpending: Record<string, number> = {};

    targetEvents.forEach((ev) => {
      totalBudget += ev.budget;

      ev.expenses.forEach((exp) => {
        if (exp.status === "paid") {
          totalSpent += exp.amount;
          categorySpending[exp.category] = (categorySpending[exp.category] || 0) + exp.amount;
        }
      });

      ev.guests.forEach((g) => {
        const guestCount = 1 + (g.plusOne || 0);
        totalGuests += guestCount;
        if (g.rsvpStatus === "attending") attendingGuests += guestCount;
        else if (g.rsvpStatus === "declined") declinedGuests += guestCount;
        else if (g.rsvpStatus === "tentative") tentativeGuests += guestCount;
        else pendingGuests += guestCount;
      });

      ev.tasks.forEach((t) => {
        totalTasks += 1;
        if (t.status === "completed") completedTasks += 1;
        else if (t.status === "in_progress") inProgressTasks += 1;
        else todoTasks += 1;
      });
    });

    const budgetUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const rsvpRate = totalGuests > 0 ? Math.round(((attendingGuests + declinedGuests) / totalGuests) * 100) : 0;

    const spendingChartData = Object.entries(categorySpending).map(([category, amount]) => ({
      category,
      amount,
    }));

    const rsvpBreakdown = [
      { name: "Attending", count: attendingGuests, fill: "#34D399" },
      { name: "Tentative", count: tentativeGuests, fill: "#F5C76B" },
      { name: "Declined", count: declinedGuests, fill: "#FB7185" },
      { name: "Pending", count: pendingGuests, fill: "#8B5CF6" },
    ];

    const taskBreakdown = [
      { name: "Completed", count: completedTasks, fill: "#34D399" },
      { name: "In Progress", count: inProgressTasks, fill: "#6366F1" },
      { name: "To Do", count: todoTasks, fill: "#A7B0C5" },
    ];

    // Recent activity
    const recentActivities = await prisma.activityLog.findMany({
      where: eventId ? { eventId } : {},
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      summary: {
        totalEvents: targetEvents.length,
        totalBudget,
        totalSpent,
        remainingBudget: Math.max(0, totalBudget - totalSpent),
        budgetUtilization,
        totalGuests,
        attendingGuests,
        rsvpRate,
        totalTasks,
        completedTasks,
        taskCompletionRate,
      },
      charts: {
        spendingByCategory: spendingChartData,
        rsvpBreakdown,
        taskBreakdown,
      },
      recentActivities,
    });
  } catch (error) {
    logger.error("Fetch analytics error", error);
    return NextResponse.json(
      { error: "Failed to compute analytics" },
      { status: 500 }
    );
  }
}

