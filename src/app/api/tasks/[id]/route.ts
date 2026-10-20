import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
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

    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.assignedTo !== undefined && { assignedTo: body.assignedTo }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.dueDate !== undefined && {
          dueDate: body.dueDate ? new Date(body.dueDate) : null,
        }),
      },
    });

    // If marked as completed or status changed, log activity
    if (body.status && body.status !== existingTask.status) {
      await prisma.activityLog.create({
        data: {
          eventId: existingTask.eventId,
          userId: user.id,
          action: "Task Status Updated",
          details: `Moved "${updated.title}" to ${updated.status}`,
        },
      });

      if (body.status === "completed") {
        await prisma.notification.create({
          data: {
            userId: existingTask.event.userId,
            title: "Task Completed",
            message: `"${updated.title}" was marked completed by ${user.name}.`,
            type: "task",
            link: `/events/${existingTask.eventId}/tasks`,
          },
        });
      }
    }

    return NextResponse.json({ success: true, task: updated });
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
