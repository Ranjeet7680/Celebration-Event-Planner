import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";


export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { preferences: true },
    });

    return NextResponse.json({ user: fullUser });
  } catch (error) {
    console.error("Fetch settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, avatar, theme, planningExperience, budgetRange, notificationsEnabled, emailUpdates } = body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(avatar !== undefined && { avatar }),
      },
    });

    if (user.preferences) {
      await prisma.userPreference.update({
        where: { userId: user.id },
        data: {
          ...(theme !== undefined && { theme }),
          ...(planningExperience !== undefined && { planningExperience }),
          ...(budgetRange !== undefined && { budgetRange }),
          ...(notificationsEnabled !== undefined && { notificationsEnabled }),
          ...(emailUpdates !== undefined && { emailUpdates }),
        },
      });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

