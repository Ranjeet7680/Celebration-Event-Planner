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
    const expenses = await prisma.expense.findMany({
      where: { eventId: id },
      orderBy: { date: "desc" },
    });

    const budget = await prisma.budget.findUnique({
      where: { eventId: id },
      include: { categories: true },
    });

    return NextResponse.json({ expenses, budget });
  } catch (error) {
    console.error("Fetch expenses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
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
    const { title, amount, category, paidBy, status, notes, date } = body;

    const parsedAmount = Number(amount);
    if (!title || isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: "A valid title and positive expense amount are required" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        eventId: id,
        title: title.trim(),
        amount: parsedAmount,
        category: category || "Other",
        paidBy: paidBy || user.name,
        status: status || "paid",
        notes: notes || null,
        date: date ? new Date(date) : new Date(),
      },
    });

    // Calculate updated total expenses to check if budget is exceeded
    const totalExpenses = await prisma.expense.aggregate({
      where: { eventId: id, status: "paid" },
      _sum: { amount: true },
    });

    const event = await prisma.event.findUnique({
      where: { id },
      include: { budgetSummary: true },
    });

    const currentTotal = totalExpenses._sum.amount || 0;
    let budgetWarning: string | null = null;
    if (event && event.budget > 0 && currentTotal > event.budget) {
      budgetWarning = `Budget exceeded! Current total spent: ${event.currency} ${currentTotal} (Budget: ${event.currency} ${event.budget})`;
      // Create budget alert notification
      await prisma.notification.create({
        data: {
          userId: event.userId,
          title: "Budget Exceeded Warning",
          message: budgetWarning,
          type: "budget",
          link: `/events/${id}/budget`,
        },
      });
    }

    await prisma.activityLog.create({
      data: {
        eventId: id,
        userId: user.id,
        action: "Expense Added",
        details: `Logged expense "${expense.title}" for ${parsedAmount} (${expense.category})`,
      },
    });

    return NextResponse.json(
      { success: true, expense, warning: budgetWarning },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create expense error:", error);
    return NextResponse.json(
      { error: "Failed to add expense" },
      { status: 500 }
    );
  }
}
