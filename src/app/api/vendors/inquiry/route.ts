import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vendorId, eventId, message, dateNeeded, budget } = await request.json();

    if (!vendorId || !eventId || !message) {
      return NextResponse.json(
        { error: "Vendor, event, and inquiry message are required" },
        { status: 400 }
      );
    }

    const inquiry = await prisma.vendorInquiry.create({
      data: {
        vendorId,
        eventId,
        userId: user.id,
        message,
        dateNeeded: dateNeeded ? new Date(dateNeeded) : new Date(),
        budget: Number(budget) || 0,
        status: "pending",
      },
    });

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });

    await prisma.activityLog.create({
      data: {
        eventId,
        userId: user.id,
        action: "Vendor Inquiry Sent",
        details: `Sent inquiry to ${vendor?.name || "Vendor"} for ${inquiry.budget}`,
      },
    });

    return NextResponse.json({ success: true, inquiry }, { status: 201 });
  } catch (error) {
    console.error("Vendor inquiry error:", error);
    return NextResponse.json(
      { error: "Failed to send vendor inquiry" },
      { status: 500 }
    );
  }
}

