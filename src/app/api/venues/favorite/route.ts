import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { venueId } = await request.json();
    if (!venueId) {
      return NextResponse.json({ error: "venueId is required" }, { status: 400 });
    }

    const existing = await prisma.venueFavorite.findUnique({
      where: {
        userId_venueId: {
          userId: user.id,
          venueId,
        },
      },
    });

    if (existing) {
      await prisma.venueFavorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ isFavorited: false });
    } else {
      await prisma.venueFavorite.create({
        data: {
          userId: user.id,
          venueId,
        },
      });
      return NextResponse.json({ isFavorited: true });
    }
  } catch (error) {
    logger.error("Toggle venue favorite error", error);
    return NextResponse.json(
      { error: "Failed to toggle favorite" },
      { status: 500 }
    );
  }
}

