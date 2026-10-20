import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizePlainString } from "@/lib/sanitize";
import { logger } from "@/lib/logger";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const cleanName = sanitizePlainString(name);
    const cleanEmail = String(email).toLowerCase().trim();

    if (cleanName.length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters long" },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Rate limit signup attempts: max 5 per minute
    const rateLimit = checkRateLimit(`signup:${cleanEmail}`, 5, 60000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again shortly." },
        { status: 429 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        passwordHash,
        preferences: {
          create: {
            theme: "midnight",
            interests: JSON.stringify(["Weddings", "Conferences", "Parties"]),
            eventTypes: JSON.stringify(["Corporate", "Wedding", "Birthday"]),
          },
        },
      },
    });

    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Signup error", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during account creation" },
      { status: 500 }
    );
  }
}
