import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const minCapacity = Number(searchParams.get("minCapacity")) || 0;
    const maxPrice = Number(searchParams.get("maxPrice")) || 999999;
    const take = Math.min(Math.max(1, Number(searchParams.get("take")) || 50), 100);

    const venues = await prisma.venue.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search } },
                  { location: { contains: search } },
                  { amenities: { contains: search } },
                ],
              }
            : {},
          { capacity: { gte: minCapacity } },
          { pricePerDay: { lte: maxPrice } },
        ],
      },
      include: {
        favorites: user ? { where: { userId: user.id } } : false,
      },
      orderBy: { rating: "desc" },
      take,
    });

    const formatted = venues.map((v) => ({
      ...v,
      isFavorited: v.favorites && v.favorites.length > 0,
      amenitiesList: JSON.parse(v.amenities || "[]"),
    }));

    return NextResponse.json(
      { venues: formatted, count: formatted.length },
      {
        headers: {
          "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("Fetch venues error:", error);
    return NextResponse.json(
      { error: "Failed to fetch venues" },
      { status: 500 }
    );
  }
}
