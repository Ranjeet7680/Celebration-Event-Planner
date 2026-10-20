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
    const tasks = await prisma.task.findMany({
      where: { eventId: id },
      include: { comments: { orderBy: { createdAt: "desc" } } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const todo = tasks.filter((t) => t.status === "todo").length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return NextResponse.json(
      {
        tasks,
        metrics: { total, completed, inProgress, todo, progressPercent },
      },
      {
        headers: {
          "Cache-Control": "private, no-cache",
        },
      }
    );
  } catch (error) {
    logger.error("Fetch tasks error", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
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
    const { title, description, assignedTo, dueDate, priority, status, category } = body;

    const cleanTitle = sanitizePlainString(title);
    if (!cleanTitle || cleanTitle.length < 2) {
      return NextResponse.json({ error: "Task title is required (minimum 2 characters)" }, { status: 400 });
    }

    const cleanDesc = description ? sanitizePlainString(description) : null;
    const cleanAssignee = assignedTo ? sanitizePlainString(assignedTo) : user.name;
    const cleanCategory = category ? sanitizePlainString(category) : "General";

    const task = await prisma.task.create({
      data: {
        eventId: id,
        title: cleanTitle,
        description: cleanDesc,
        assignedTo: cleanAssignee,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || "medium",
        status: status || "todo",
        category: cleanCategory,
      },
    });

    await prisma.activityLog.create({
      data: {
        eventId: id,
        userId: user.id,
        action: "Task Created",
        details: `Created task "${task.title}" with priority ${task.priority}`,
      },
    });

    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (error) {
    logger.error("Create task error", error);
    return NextResponse.json(
      { error: "Failed to add task" },
      { status: 500 }
    );
  }
}
