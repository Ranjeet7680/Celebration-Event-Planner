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

    return NextResponse.json({
      tasks,
      metrics: { total, completed, inProgress, todo, progressPercent },
    });
  } catch (error) {
    console.error("Fetch tasks error:", error);
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
    const body = await request.json();
    const { title, description, assignedTo, dueDate, priority, status, category } = body;

    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        eventId: id,
        title: title.trim(),
        description: description || null,
        assignedTo: assignedTo || user.name,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || "medium",
        status: status || "todo",
        category: category || "General",
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
    console.error("Create task error:", error);
    return NextResponse.json(
      { error: "Failed to add task" },
      { status: 500 }
    );
  }
}
