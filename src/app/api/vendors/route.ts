import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search") || "";

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
    });

    return NextResponse.json({ vendors });
  } catch (error) {
    console.error("Fetch vendors error:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}

