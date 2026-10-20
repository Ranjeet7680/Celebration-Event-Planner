import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search") || "";
    const take = Math.min(Math.max(1, Number(searchParams.get("take")) || 50), 100);

    const vendors = await prisma.vendor.findMany({
      where: {
        AND: [
          category && category !== "all" ? { category } : {},
          search
            ? {
                OR: [
                  { name: { contains: search } },
                  { location: { contains: search } },
                  { description: { contains: search } },
                ],
              }
            : {},
        ],
      },
      orderBy: { rating: "desc" },
      take,
    });

    return NextResponse.json(
      { vendors, count: vendors.length },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Fetch vendors error:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}
